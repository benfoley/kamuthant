import { Injectable  } from "@angular/core"
import { AttachmentService } from "./attachment-service"
import { ConnectivityService } from "./connectivity-service"
import { DatabaseService } from "./database-service"
import { EntryService } from "./entry-service"
import { LanguageService } from "./language-service"
import { BehaviorSubject } from "rxjs/BehaviorSubject"


@Injectable()
export class SyncService {

  _lettersLoading$: BehaviorSubject<any> = new BehaviorSubject([])
  _lettersLoaded$ : BehaviorSubject<any> = new BehaviorSubject(null)
  lettersLoading: any = []
  lettersLoaded: any = {}
  languagesSub: any
  worker: any


  constructor(
    public attachmentService: AttachmentService,
    public connectivityService: ConnectivityService,
    public databaseService: DatabaseService,
    public entryService: EntryService,
    public languageService: LanguageService
  ) {
    this.init()
  }

  get lettersLoading$() {
    return this._lettersLoading$.asObservable()
  }
  get lettersLoaded$() {
    return this._lettersLoaded$.asObservable()
  }


/*
1 online ?

  1a compare db versions
  1b download data if they differ
  1c use local if they match

2 offline sole?

  2a get letters from pouch
  2b get entries from pouch
  2c show letters for these entries

  3a check connection
  3b try to download


offline?
  no letters? notify

online?
  get dbversion
  if no letters/entries
    get all letters and entries
  else
    download letters
    download entries since last dbversion

 */

  init() {

    // Initialise arrays to track the UI letter buttons
    // store the letters that we have words for, using lang code as the key
    // eg {'ENG': ['a',j'], 'KY': ['a','b']}
    // 
    this.languagesSub = this.languageService.languages$.subscribe((languages) => {
      for (let language of languages) {
        if (typeof(this.lettersLoaded[language.code])=="undefined") this.lettersLoaded[language.code] = []
      }
    })

    // Publish letter arrays when language changes
    this.languageService.languageCode$.subscribe( (languageCode) => {
      this._lettersLoaded$.next(this.lettersLoaded[languageCode])
    })

    //  TEMPORARILY
    this.getEntriesForLetter(['a','b','c'])

    // if (this.connectivityService.isOnline()) {
    //   // online
    //   // 1a Compare db versions
    //   this.databaseService.getFromPouch("dbVersion")
    //     .then((pdbVersion) => {
    //       this.databaseService.getFromFirebase("dbVersion")
    //         .then((fdbVersion) => {
    //           if (fdbVersion !== pdbVersion) {
    //             // 1b Different db versions, download all data
    //             this.downloadAll()
    //           } else {
    //             // 1c Matching db versions, use local data
    //             this.loadAll()
    //           }
    //         })
    //         .catch((err) => {
    //           console.log("couldn't get db version from firebase")
    //           this.loadAll()
    //         })
    //     })
    //     .catch((err) => {
    //       console.log("no local dbversion, download all")
    //       this.downloadAll()
    //     })
    // } else {
    //   // offline
    //   this.loadAll()
    // }
    
  }


  // . . . . . . . . . . . . . . . . . . . . . . . . . . .

  // loadAll() {
  //   console.log("SS loadAll")
  //   // 2a get letters from pouch
  //   this.databaseService.getFromPouch("letters")
  //     .then((letters) => {
  //       // 2b get get entries from pouch
  //       this.databaseService.getFromPouch("entries")
  //         .then((entries) => {
  //           this.showLettersLoaded(entries)
  //           this.entryService.replaceEntries(entries)
  //       })
  //     })
  //     .catch((err) => {
  //       // 3a do we have a connection ?
  //       if (this.connectivityService.isOnline()) {
  //         // 3b try to download letters, then entries
  //         this.downloadAll()
  //       } else {
  //         // no connection. can't download
  //         let msg = "no letters, no connection, can't download the words"
  //         console.log(msg)
  //       }
  //     })
  // }

  // downloadAll() {
  //   console.log("downloadAll")

  //   this.databaseService.getFromFirebase("dbVersion")
  //     .then((dbVersion) => {
  //       console.log('retrieved dbVersion from firebase', dbVersion)
  //       // save dbVersion to pouch for next time
  //       let doc = {"_id": "dbVersion", "dbVersion":dbVersion}
  //       this.databaseService.insertOrUpdate(doc)
  //     })

  //   this.databaseService.getFromFirebase("letters")
  //     .then((letters) => {
  //       // save letters to pouch for next time
  //       let doc = {"_id": "letters", "letters":letters}
  //       this.databaseService.insertOrUpdate(doc)
  //       this.getEntriesForLetter(letters)
  //   //   })
  // }

  // . . . . . . . . . . . . . . . . . . . . . . . . . . .

  getEntriesForLetter(letters) {

    letters.map( (letter) => {
      this.lettersLoadingAdd(letter)

      this.databaseService.queryFirebase('entries', 'initial', letter)
      .then(async (entries:any) => {

        if (entries) {
          // convert firebase object to array so we can iterate 
          let i=0, entriesArr=[]
          for (var ob in entries) {
            let tmpEntry = entries[ob]
            // keep the id
            tmpEntry["id"] = ob
            entriesArr[i++] = tmpEntry
          }
          let promises = entriesArr.map( async (entry) => {
            this.entryService.saveEntry(entry)
            this.entryService.addEntryToIndex(entry)
            if (entry.assets) await this.attachmentService.saveAttachments(entry)

          })
          await Promise.all(promises)
          .then(()=>{
            this.entryService.saveIndex()
            this.updateLetterUI(entriesArr)
          })
          .catch((err)=>console.log(err))
        }
        // update the loading UI - what is left to download?
        this.lettersLoadingDelete(letter)
      })
    })
  }

  async updateLetterUI(entries) {
    for (let lang in this.lettersLoaded){
      for (let i in entries) {
        let letter = this.getLetter(lang, entries[i])
        if (this.lettersLoaded[lang].indexOf(letter) == -1) {
          this.lettersLoaded[lang].push(letter)
        }
      }
      this.lettersLoaded[lang].sort()
    }
  }

  getLetter(lang, entry) {
    if (lang=='ENG') {
      let word = this.entryService.flattenSenses(entry)
      return this.entryService.getInitial(word) 
    } else {
      return entry.initial.toLowerCase()
    }

  }


  lettersLoadingAdd(letter) {
    this.lettersLoading.push(letter)
    this._lettersLoading$.next(this.lettersLoading)
  }

  lettersLoadingDelete(letter) {
    if (this.lettersLoading.length > 0) {
      let index = this.lettersLoading.indexOf(letter)
      if (index > -1) this.lettersLoading.splice(index, 1)
      this._lettersLoading$.next(this.lettersLoading)
      // check again. if there are no letters left, we're done
    }
  }

  // showLettersLoaded(entries) {
  //   // 2c work out the letters to show
  //   for (let lang in this.lettersLoaded){
  //     for (let key in entries) {
        
  //       // for <LANG> we can use entry.initial
  //       // but for <ENG> we need to get data from the ge/def - so use the entry service's flatten helper
  //       let entry = entries[key]
  //       let flattenedSenses = this.entryService.flattenSenses(entry)
  //       let char = (lang=='ENG') ? this.entryService.getInitial(flattenedSenses) : entry.initial.toLowerCase()

  //       if (this.lettersLoaded[lang].indexOf(char) == -1 ) this.lettersLoaded[lang].push(char)

  //       this.lettersLoaded[lang].sort()
  //     }
  //   }
  // }

}
