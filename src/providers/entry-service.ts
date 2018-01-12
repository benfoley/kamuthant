import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject"
import { Subject } from "rxjs/Subject"
import { DatabaseService } from './database-service'
import { LanguageService } from './language-service'


@Injectable()
export class EntryService {

  // Use entriesAll as a memory cache of all the entries,
  entriesAll: any
  entriesIndex: any
  // Subscribe to this for current filtered entry list
  _entries$: Subject<any> = new Subject()
  _entriesIndex$: BehaviorSubject<any> = new BehaviorSubject({})
  _searchIndex$: BehaviorSubject<any> = new BehaviorSubject({})

  _letters$: Subject<any> = new Subject()

  // The currently selected language
  languageCode: any
  langSub: any
  

  constructor(
    public databaseService: DatabaseService,
    public languageService: LanguageService
  ) {
    this.langSub = this.languageService.languageCode$.subscribe((code) => this.languageCode = code)
    // this.getEntriesIndex()
  }

  get letters$() {
    return this._letters$.asObservable()
  }
  get entries$() {
    return this._entries$.asObservable()
  }
  get entriesIndex$() {
    return this._entriesIndex$.asObservable()
  }
  get searchIndex$() {
    return this._searchIndex$.asObservable()
  }

  ngOnDestroy() {
    this.langSub.unsubscribe()
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
      if (ge==null) ge = ''
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
  initEntriesIndex(){
    this.entriesIndex = {}
    for (let language of this.languageService.languages) {
      this.entriesIndex[language.code] = {}
    }
  }
  async getEntriesIndex(){
    try {
      this.entriesIndex = await this.databaseService.getConfig("index")
      this._entriesIndex$.next(this.entriesIndex)
      return this.entriesIndex.data
    } catch(err) {
      console.log("ES couldn't get index")
    }
  }

  async getAdjacentIdsInIndex(lang, char, id){
    if (typeof(this.entriesIndex)=="undefined") await this.getEntriesIndex()
      console.log('this.entriesIndex', lang, char, id)
    let index = this.entriesIndex[lang][char]
    let i = 0
    for (let j of index) {
      if (j == id) {
        let prev, next
        prev = (i>0) ? index[i-1] : false
        next = (i < index.length) ? index[i+1] : false
        // object keys match animation keywords for ui laziness
        return {back:prev, forward:next}
      }
      ++i
    }
  }

  saveIndex() {
    return new Promise((resolve, reject) => {
      // update our handy index list
      let index = {"_id": "index", "data": this.entriesIndex}
      // broadcast it
      this._entriesIndex$.next( this.entriesIndex )
      // persist it
      this.databaseService.insertOrUpdateConfig(index)
        .then((res)=>{
          resolve()
        })
        .catch((err)=> {
          console.log("saveIndex err", err)
          reject()
        })
    })
  }

  async saveLetters() {
    let letters = {}
    for (let lang in this.entriesIndex) {        
      letters[lang] = Object.keys(this.entriesIndex[lang])
    }
    this._letters$.next(letters)
    try {
      let letterDoc = {"_id": "letters", "data": letters}
      return await this.databaseService.insertOrUpdateConfig(letterDoc)
    } catch (err) {
      throw err
    }
  }

  async getLetters() {
    console.log("getLetters")
    try {
      let letters = await this.databaseService.getConfig("letters")
      this._letters$.next(letters)
      return letters
    } catch (err) {
      throw err
    }
  }

  async saveEntries(entries) {
    let docs = []
    await this.initEntriesIndex()
    for (let i in entries) {
      let entry = entries[i]
      entry.id = i
      entry.engSearch = this.flattenSenses(entry)
      entry.engInitial = this.getInitial(entry.engSearch)
      let doc = {"_id": entry.id, "data": entry}
      docs.push(doc)
      let char
      for (let lang in this.entriesIndex) {
        if (lang=='ENG') {
          char = entry.engInitial
        } else {
          char = entry.initial
        }
        // create letter array
        if (typeof(this.entriesIndex[lang][char])=="undefined") {
          this.entriesIndex[lang][char] = []
        }
        // add the entry
        this.entriesIndex[lang][char].push(entry.id)
      }
    }
    try {
      await this.saveIndex()
    } catch (err) {
      throw err
    }
    try {
      await this.saveLetters()
    } catch (err) {
      console.log('error doing saveLetters',)
      throw err
    }
    try {
      return await this.databaseService.bulkDocs(docs)
    } catch (err) {
      throw err
    }
  }

  async saveEntry(doc) {
    try {
      return await this.databaseService.insertOrUpdate(doc)
    } catch (err) {
      console.log("save entry error", err)
      throw err
    }
  }


  async getEntry(id) {
    try {
      return await this.databaseService.getFromPouch(id)
    } catch(err){
      console.log("getEntry error", err)
    }
  }


  async getEntriesForLetter(letter) {
    if (typeof(this.entriesIndex)=="undefined") await this.getEntriesIndex()
    // get the ids of entries in this index
    let ids = this.entriesIndex[this.languageCode][letter]
    console.log(ids)
    if (ids) {
      let res = await this.databaseService.pdb.allDocs({
        keys: ids,
        include_docs: true,
        attachments: true,
        binary: true
      })
      this._entries$.next(res.rows)
    } else {
      this._entries$.next([])
    }
  }


  // need to add the eng word search value to the main entriesindex
  async getSearchIndex() {
    if (typeof(this.entriesIndex)=="undefined") await this.getEntriesIndex()
    let arr = []
    for (let letter in this.entriesIndex[this.languageCode]) {
      this.entriesIndex[this.languageCode][letter].map(item => {arr.push(item)})
    }
    this._searchIndex$.next(arr)
  }  


  async getSearchEntries(items) {
    let arr = []
    if (items) {
      if (!this.entriesAll) this.entriesAll = await this.databaseService.getAllEntries()
      arr  = this.entriesAll.rows.filter((array_el) => {
         return items.filter((anotherOne_el) => {
            return anotherOne_el.id == array_el.id;
         }).length > 0
      });
      return arr
    }
  }


  async groupAttachments(attachments) {
    // console.log("ES groupAttachments for", id)
    // let attachments = await this.databaseService.getAttachments(id)
    let audios = [], images = []
    for (let i in attachments) {
      let att = attachments[i]
      if ((att.content_type=="audio/mp3") || (att.content_type=="audio/wav")) {
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
