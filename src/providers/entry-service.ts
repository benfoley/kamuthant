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
  entriesIndex: any
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

  }

  get entries$() {
    return this._entries$.asObservable()
  }


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


  // Update our collection with retrieved firebase objects

  mergeEntries(entries) {
    console.log('mergeEntries', entries)
    console.log("entries length: ", entries.length)

    if (! entries.length) return 

    // Any attachments to save?
    this.attachmentService.saveAttachments(entries)

    // Combine with our existing entries (need to de-duplicate?)
    Object.assign(this.entriesAll, entries)

    console.log("build index", this.entriesIndex)
    // this.buildIndex(entries)

    // Save to pouch
    let doc = {"_id": this.databaseService.entriesKey}
    doc[this.databaseService.entriesKey] = this.entriesAll
    this.databaseService.insertOrUpdate(doc)
      .then((res)=>{
        console.log("mergeEntries update db")
        console.log(res)
      })
      .catch((err)=>{
        console.log("mergeEntries update err")
        console.log(err)
      })
  }

  // Replace collection with pouch data

  replaceEntries(entries) {
    console.log("replaceEntries: entries")
    console.log(entries)
    this.entriesAll = entries
  }

  buildIndex(entries){
    // Create the index if it isn't already made
    this.entriesIndex = {}
    for (let language of this.languageService.languages) {
      this.entriesIndex[language.code] = []
    }
    // Add the entry to the index
    for (let lang in this.entriesIndex) {
      for (let key in entries) {
        let entry = entries[key]
        this.addEntryToIndex(lang, key, entry)
      }
      // Sort the arrays by the word value
      for(let key in this.entriesIndex[lang]) {
        let arr = this.entriesIndex[lang][key]
        arr.sort(this.dynamicSort("word"))
      }
    }
  }

  // Change this to use ID instead of word value
  // 
  addEntryToIndex(lang, key, entry) {
    let char, word
    if (lang=='ENG') {
      let flattened = this.flattenSenses(entry)
      char = this.getInitial(flattened)
      word = this.getWord(flattened)
    } else {
      char = entry.initial
      word = entry.lx
    }

    if (typeof(this.entriesIndex[lang][char])=="undefined") {
      this.entriesIndex[lang][char] = []
    }
    this.entriesIndex[lang][char].push({key:key, word:word})
  }

  dynamicSort(property) {
    let sortOrder = 1
    if(property[0] === "-") {
      sortOrder = -1
      property = property.substr(1)
    }
    return function (a,b) {
      let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0
      return result * sortOrder
    }
  }

  getInitial(word) {
    return(word.charAt(0))
  }

  getWord(word) {
    word = word.replace(/\./," ").toLowerCase()
    return(word.split(" ")[0])
  }

  getEntry(key) {
    return(this.entriesAll[key])
  } 

  async getEntries() {
    await this.databaseService.getFromPouch("entries")
      .then((entries) => {
        this.entriesAll = entries
        this.buildIndex(entries)
      })
  }

  async getEntriesByLetter(letter) {
    let arr
    await this.getEntries()
    if (this.entriesIndex[this.languageCode][letter]) {
      arr = this.entriesIndex[this.languageCode][letter].map( (e) => {
        let entry = this.entriesAll[e.key]
        entry.key = e.key
        return entry
      })
    } else {
      // No entries for this lang:letter combo
      arr = []
    }
    this._entries$.next( arr )
  }


}
