import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { ConnectivityService } from "./connectivity-service"

import firebase from 'firebase'
import PouchDB from 'pouchdb'

@Injectable()
export class DatabaseService {

  entriesKey: string = "entries"
  cdb: any
  pdb: any
  appOnline: boolean
  _dbVersion$: BehaviorSubject<any> = new BehaviorSubject(null)

  constructor(
    public connectivityService: ConnectivityService
    ) {

    // create or open the db
    this.cdb  = new PouchDB('Config', {auto_compaction: true})
    this.pdb  = new PouchDB('Dictionary', {auto_compaction: true})

    connectivityService.status.subscribe((status) => {
      this.appOnline = (status !== 'offline')
    })

    this.getDbVersion()

  }

  get dbVersion$() {
    return this._dbVersion$.asObservable()
  }

  getDbVersion() {
    this.getFromFirebase("dbVersion").then((data:any) => {
      this._dbVersion$.next(data)
    })
  }


  // POUCH - - - - - - - - - - - - - - - -



  async getConfig(key) {
    try {
      let doc = await this.cdb.get(key, {include_docs: true})
      return doc.data
    } catch (err) {
      throw new Error(err)
    }
  }

  async insertOrUpdateConfig(doc) {
    // does this record exist? if so, use the rev id to update
    try {
      let _doc = await this.cdb.get(doc._id, {include_docs: true})
      doc._rev = _doc._rev
      return await this.cdb.put(doc)
    } catch(err) {
      return await this.cdb.put(doc)
    }
  }


  async getFromPouch(key) {
    try {
      let doc = await this.pdb.get(key, {include_docs: true, attachments: true, binary: true})
      return doc
    } catch (err) {
      console.log(err)
    }
  }

  async getAllEntries(){
    try {
      return await this.pdb.allDocs({include_docs: true, attachments: true, binary: true})
    } catch (err) {
      console.log(err)
    }
  }

  async getEntry(docId) {
    try {
      return await this.pdb.get(docId)
    } catch (err) {
      console.log(err);
    }
  }

  async insertOrUpdate(doc) {
    try {
      let _doc = await this.pdb.get(doc._id, {include_docs: true})
      doc._rev = _doc._rev
      return await this.pdb.put(doc)
    } catch(err) {
      return await this.pdb.put(doc)
    }
  }


  async getAttachment(docId, name) {
    try {
      let doc = await this.pdb.getAttachment(docId, name)
      return doc
    } catch (err) {
      console.log(err)
    }
  }

  async getAttachments(docId) {
    try {
      let doc = await this.pdb.get(docId, {attachments: true, binary: true});
      return doc._attachments
    } catch (err) {
      console.log(err);
    }
  }

  // FIREBASE - - - - - - - - - - - - - - - -

  getFromFirebase(key) {
    return new Promise((resolve, reject) => {
      firebase.database().ref(key)
          .once('value')
          .then((snapshot) => resolve(snapshot.val()) )
          .catch((err) => reject(err))
    })
  }

  queryFirebase(location, child, value) {
    return new Promise((resolve, reject) => {
      firebase.database().ref(location)
          .orderByChild(child)
          .equalTo(value)
          .once('value')
          .then((snapshot) => resolve(snapshot.val()) )
          .catch((err) => reject(err))
    })
  }
}
