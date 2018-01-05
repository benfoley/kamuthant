import { Injectable } from "@angular/core"
import { AttachmentService } from "./attachment-service"
import { ConnectivityService } from "./connectivity-service"
import { DatabaseService } from "./database-service"
import { EntryService } from "./entry-service"
import { LanguageService } from "./language-service"
import { BehaviorSubject } from "rxjs/BehaviorSubject"


@Injectable()
export class SyncService {

  _lettersLoading$: BehaviorSubject<any> = new BehaviorSubject([])
  lettersLoading: any = []

  constructor(
    public attachmentService: AttachmentService,
    public connectivityService: ConnectivityService,
    public databaseService: DatabaseService,
    public entryService: EntryService,
    public languageService: LanguageService
  ) {
  }

  /*
  get local db version
  yes ->  compare it with remote, use local if they match, download all if remote is newer
  no  ->  download all if there's a connection
  */

  async syncCheck() {
    try {
      let LocalDatabaseVersion = await this.getLocalDatabaseVersion()
      this.syncDatabases(LocalDatabaseVersion)
    } catch(err) {
      if (this.connectivityService.isOnline()) {
        this.downloadAll()
      } else {
        this.notifyNoConnection()
      }
    }
  }

  async syncDatabases(LocalDatabaseVersion) {
    try {
      let RemoteDatabaseVersion = await this.getRemoteDatabaseVersion()
      if (this.connectivityService.isOnline()) {

          // for testing
          // LocalDatabaseVersion = "0.0.0"

          if (LocalDatabaseVersion==RemoteDatabaseVersion) {            
            this.loadAll()
          } else {
            this.downloadAll()
          }
      } else {
        this.notifyNoConnection()
        this.loadAll()
      }
    } catch(err) {
       console.log(err)
    }
  }


  async getLocalDatabaseVersion() {
    try {
      let config = await this.databaseService.getConfig("dbVersion")
      return config
    } catch (err) {
      console.log("local db version is missing")
    }
  }


  async getRemoteDatabaseVersion() {
    return this.databaseService.getFromFirebase("dbVersion")
  }


  async downloadAll() {
    this.databaseService.getFromFirebase("dbVersion")
      .then((dbVersion) => {
        // save dbVersion to pouch for next time
        let doc = {"_id": "dbVersion", "data":dbVersion}
        this.databaseService.insertOrUpdateConfig(doc)
      })
    this.databaseService.getFromFirebase("letters")
      .then((letters) => {
        // save letters to pouch for next time
        let doc = {"_id": "letters", "data":letters}
        this.databaseService.insertOrUpdateConfig(doc)
        // reset the index
        this.entryService.initIndex()
        // get the entries
        this.downloadEntriesForLetter(letters)
      })  
    return true
  }


  async loadAll() {
    console.log("load all happens from home.ts")
    return true
  }


  notifyNoConnection() {
    console.log("Can't update, please check connection.")
  }


  // . . . . . . . . . . . . . . . . . . . . . . . . . . .

  downloadEntriesForLetter(letters) {
    letters.map( (letter) => {
      this.databaseService.queryFirebase('entries', 'initial', letter)
      .then(async (entries:any) => {
        if (entries) {
          this.lettersLoadingAdd(letter)
          // convert firebase object to array so we can iterate 
          let i=0, entriesArr=[]
          for (var ob in entries) {
            // keep the id
            let tmpEntry = entries[ob]
            tmpEntry["id"] = ob
            entriesArr[i++] = tmpEntry
          }
          let promises = entriesArr.map( async (entry) => {
            let doc = {"_id":entry.id, "data":entry}
            this.entryService.saveEntry(doc)
            this.entryService.addEntryToIndex(entry)
            if (entry.assets) await this.attachmentService.saveAttachments(entry)
          })
          await Promise.all(promises)
          .then(()=>this.entryService.saveIndex())
          .catch((err)=>console.log(err))
          this.lettersLoadingRemove(letter)
        }
      })
    })
  }

  get lettersLoading$() {
    return this._lettersLoading$.asObservable()
  }
  lettersLoadingAdd(letter) {
    this.lettersLoading.push(letter)
    this._lettersLoading$.next(this.lettersLoading)
  }
  lettersLoadingRemove(letter) {
    if (this.lettersLoading.length > 0) {
      let index = this.lettersLoading.indexOf(letter)
      if (index > -1) this.lettersLoading.splice(index, 1)
      this._lettersLoading$.next(this.lettersLoading)
    }
  }

}
