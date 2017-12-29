import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject"
import { AttachmentService } from './attachment-service'
import { DatabaseService } from './database-service'
import { LanguageService } from './language-service'

declare var cordova: any

@Injectable()
export class EntryService {

  // Use entriesAll as a memory cache of all the entries,
  // Then the observable (entries$) can be the entries for the current state
  entriesAll: any = {}
  entriesIndex: any = []
  // Subscribe to this for current filtered entry list
  _entries$: BehaviorSubject<any> = new BehaviorSubject({})

  // The currently selected language
  languageCode: any

  constructor(
    public attachmentService: AttachmentService,
    public databaseService: DatabaseService,
    public languageService: LanguageService
  ) {
    this.languageService.languageCode$.subscribe((language) => this.languageCode = language)
    if (this.entriesIndex.length == 0) this.initIndex()
  }

  get entries$() {
    return this._entries$.asObservable()
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
  
  async addEntryToIndex(id, entry) {
    let lang, char, word
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
      this.entriesIndex[lang][char].push({id:id, word:word})

      console.log("this.entriesIndex", this.entriesIndex)
    }
  }

  // Save each entry to PouchDB
  // 
  async saveEntriesLocally(entries) {
    for (let id in entries) {
      let entry = entries[id]
      // Save the entry to pouch
      let doc = {"_id": id, "data": entry}
      await this.databaseService.insertOrUpdate(doc)
        .then((res)=>{
          console.log("updated doc", res)
        })
        .catch((err)=>{
          console.log("insertOrUpdate err", err)
        })
      let x = await this.addEntryToIndex(id, entry)
      let index = {"_id": "index", "data": this.entriesIndex}
      this.databaseService.insertOrUpdateIndex(index)
        .then((res)=>{console.log(res)})
        .catch((err)=>{console.log(err)})
    }
  }


  async getEntriesByLetter(letter) {

    // get the index from the db
    // 
    let index = await this.databaseService.getIndex()
    console.log("index")
    let items = index.rows[0].doc.data[this.languageCode][letter]

    let arr = []
    if (items) {
      for(let item of items) {
        console.log(item)
        // build an array with the real entries
        this.databaseService.getFromPouch(item.id).then((res:any)=>{
          if (res.data) arr.push(res.data)
        })     
      }
    }
    console.log(arr)
    this._entries$.next( arr )
  }


}
