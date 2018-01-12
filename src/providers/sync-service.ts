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




  async sync() {
    let ldbv, rdbv
    // get local db version
    // if this fails (should check if local entries exist), download all then bail
    try {
      ldbv = await this.getLocalDatabaseVersion()
    } catch (err) {
      console.log('SS could not get local db version', err)
      await this.download()
      throw err
    }
    // now try and get remote db version
    // if this fails, then bail
    try {
      rdbv = await this.getRemoteDatabaseVersion()
    } catch (err) {
      console.log('SS could not get remote db version', err)
      throw err
    }
    
    // hijack the local version number to force download, for testing purposes
    // ldbv = '0.0.0'
    
    console.log(JSON.stringify(ldbv), JSON.stringify(rdbv))

    // if the versions match, we don't need to do anything
    if (ldbv==rdbv) {
      console.log('SS versions match. use local data')
      // get letters from the db
      await this.entryService.getLetters()
      return true
    } else {
      console.log('SS versions do not match. download new data')
      try {
        await this.download(rdbv)
        return true
      } catch (err) {
        throw err
      }
    }
  }


  async download(rdbv?) {
    let entries
    try {
      entries = await this.downloadAll()
      if (entries) {
        // note that pouch will return even if there is revision clash
        await this.entryService.saveEntries(entries)
        try {
          // save the db version
          let version = (rdbv) ? rdbv : await this.getRemoteDatabaseVersion()
          let doc = {"_id": "dbVersion", "data":version}
          await this.databaseService.insertOrUpdateConfig(doc)
        } catch (err) {
          console.log('err', err)
        }
      } 
      return entries
    } catch (err) {
      console.log('SS could not download all', err)
      throw err
    }
  }




  async getLocalDatabaseVersion() {
    try {
      return await this.databaseService.getConfig("dbVersion")
    } catch (err) {
      throw err
    }
  }

  async getRemoteDatabaseVersion() {
    try {
      let res = await this.databaseService.getFromFirebase("dbVersion")
      console.log('getRemoteDatabaseVersion', res)
      return res
    } catch (err) {
      throw err
    }
  }


  async downloadAll() {
    console.log('SS downloadAll')
    try {
      return await this.databaseService.getFirebase('entries')
    } catch (err) {
      console.log('download all error', err)
      throw err
    }
  }

  notifyNoConnection() {

  }



}
