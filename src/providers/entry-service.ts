import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject"
import { DatabaseService } from './database-service'
import { LanguageService } from './language-service'

declare var cordova: any

@Injectable()
export class EntryService {

  // Use entriesAll as a memory cache of all the entries,
  // Then the observable (entries$) can be the entries for the current state
  entriesAll: any = {}
  entriesIndex: any
  // Subscribe to this for current filtered entry list
  _entries$: BehaviorSubject<any> = new BehaviorSubject([])
  _entriesIndex$: BehaviorSubject<any> = new BehaviorSubject({})

  // The currently selected language
  languageCode: any

  constructor(
    public databaseService: DatabaseService,
    public languageService: LanguageService
  ) {
    this.languageService.languageCode$.subscribe((code) => this.languageCode = code)
    this.getIndex()
  }

  get entries$() {
    return this._entries$.asObservable()
  }
  get entriesIndex$() {
    return this._entriesIndex$.asObservable()
  }

  search(term) {
    // nothing yet
  }

  // This munges together all the def/ge words in entry senses
  // useful for ordering and searching entries
  // outputs something like; tide.go.down.tide.be.low
  // 
  flattenSenses(entry) {
    let word, def, ge
    if (entry.senses) {
      // senses may be an array or singular
      if (entry.senses.length > 0) {
        if (entry.senses[0].def) def = entry.senses[0].def
        if (entry.senses[0].ge) ge = entry.senses[0].ge
      } else {
        if (entry.senses.def) def = entry.senses.def
        if (entry.senses.ge) ge = entry.senses.ge
      }
      // def / ge might be arrays, so just get the first item
      if ( (typeof(def)=="object") && (def.length > 0) ) def = def[0]
      if ( (typeof(ge)=="object") && (ge.length > 0) ) ge = ge[0]
      // combine so searches can search easily on either def or ge values
      word = def + ge
      // sanitise - drop hyphens
      if (word) word = word.replace(/[-]/g,"")
      // sanitise - everything else non-alpanumeric gets replaced by a period
      if (word) word = word.replace(/[^a-zA-Z0-9]+/g,".").toLowerCase() // \.\?\"
    } else {
      // no senses. log this so we can fix the data
      console.log('MISSING senses', entry)
    }
    if (typeof(word)=="undefined") return false
    return word
  }


  // Just returns the first character of a word
  // 
  getInitial(word) {
    return(word.charAt(0))
  }

  getFirstWord(word) {
    word = word.replace(/\./," ").toLowerCase()
    return(word.split(" ")[0])
  }

  // DELETE ME
  mergeEntries(entries) {
  }


  // We use an index to assist lookup of words by letter, and for nav between entries
  // 
  initIndex(){
    this.entriesIndex = {}
    for (let language of this.languageService.languages) {
      this.entriesIndex[language.code] = {}
    }
  }
  async getIndex(){
    try {
      this.entriesIndex = await this.databaseService.getConfig("index")
      this._entriesIndex$.next(this.entriesIndex)
      return this.entriesIndex.data
    } catch(err) {
      console.log("couldn't get index")
    }
  }

  async getAdjacentIdsInIndex(lang, char, currentIndex){
    console.log("getNextIdInIndex",lang, char, currentIndex)
    if (typeof(this.entriesIndex)=="undefined") await this.getIndex()
    let index = this.entriesIndex[lang][char]
    let i = 0
    for (let obj of index) {
      if (obj.id != currentIndex) {
        // nothing
      } else {
        console.log("match", i, obj.word, currentIndex)
        let prev, next
        prev = (i>0) ? index[i-1] : false
        next = (i < index.length) ? index[i+1] : false
        // object keys match animation keywords for ui laziness
        return {back:prev, forward:next}
      }
      ++i
    }
  }

  addEntryToIndex(entry) {
    return new Promise((resolve) => {
      let char, word
      for (let lang in this.entriesIndex) {
        if (lang=='ENG') {
          let flattened = this.flattenSenses(entry)
          char = this.getInitial(flattened)
          word = this.getFirstWord(flattened)
        } else {
          char = entry.initial
          word = entry.lx
        }
        if (typeof(this.entriesIndex[lang][char])=="undefined") {
          this.entriesIndex[lang][char] = []
        }
        this.entriesIndex[lang][char].push({id:entry.id, word:word})
      }
      resolve()
    })
  }

  saveIndex() {
    return new Promise((resolve) => {
      // update our handy index list
      let index = {"_id": "index", "data": this.entriesIndex}
      // broadcast it
      this._entriesIndex$.next( this.entriesIndex )
      // persist it
      this.databaseService.insertOrUpdateConfig(index)
        .then((res)=>{
          resolve()
        })
        .catch((err)=> console.log("saveIndex err", err))
    })
  }


  saveEntry(doc) {
    return new Promise(resolve => {
      // Save the entry to pouch
      // let doc = {"_id": entry.id, "data": entry}
      this.databaseService.insertOrUpdate(doc)
        .then((res)=>{
          resolve()
        })      
    })
  }
  
  async getEntry(id) {
    try {
      return await this.databaseService.getFromPouch(id)
    } catch(err){
      console.log("getEntry error", err)
    }
  }

  async getEntriesByLetter(letter) {
    if (typeof(this.entriesIndex)=="undefined") await this.getIndex()
    // get the real entry for each item in the index
    let items = this.entriesIndex[this.languageCode][letter]
    let arr = []
    if (items) {
      await Promise.all( items.map( async (item) => {
        await this.databaseService.getFromPouch(item.id).then((res:any)=>{
          if (res) {
            arr.push(res)
          }
        })
      }))
    }
    this._entries$.next( arr )
  }
  


  async groupAttachments(attachments) {
    let audios = [], images = []
    for (let i in attachments) {
      let att = attachments[i]
      if (att.content_type=="audio/wav") {
        audios.push(att)
      }
      if (att.content_type=="image/jpeg") {
        images.push(this.blobToUrl(att.data))
      }
    }
    return {audios:audios, images:images}
  }

  blobToUrl(blob) {
    return URL.createObjectURL(blob)
  }

  // async getAttachment(entry, name) {
  //  return await this.databaseService.getAttachment(entry.id, name)
  // }
  // async getAttachments(entry) {
  //   return await this.databaseService.getAttachments(entry.id)
  // }
}
