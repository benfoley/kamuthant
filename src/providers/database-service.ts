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
  pdb: any
  pdbi: any
  appOnline: boolean
  _dbVersion$: BehaviorSubject<any> = new BehaviorSubject(null)

  constructor(
    public connectivityService: ConnectivityService
    ) {

    // create or open the db
    this.pdb  = new PouchDB('Dictionary');
    this.pdbi = new PouchDB('Index');

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


  async getIndex(){
    try {
      var result = await this.pdbi.allDocs({
        include_docs: true,
        attachments: true
      })
      return result
    } catch (err) {
      console.log(err)
    }
  }

  insertOrUpdateIndex(doc) {
    
    console.log("saving index", JSON.stringify( doc ))


    return new Promise((resolve, reject) => {
      this.pdbi.get(doc._id, {include_docs: true})
      .then((_doc) => {
          console.log("index exists, update it")
          doc._rev = _doc._rev
          resolve(this.pdbi.put(doc))
      })
      .catch((err) => {
          console.log("no index, save it")
          resolve(this.pdbi.put(doc))
      })
    })
  }


  async getFromPouch(key) {
    
    try {
      let doc = await this.pdb.get(key)
      return doc
    } catch (err) {
      console.log(err);
    }

    // return new Promise((resolve, reject) => {
    //   this.pdb.get(key)
    //     .then((doc) => {
    //       console.log("getFromPouch", doc)
    //       resolve(doc)
    //     })
    //     .catch((err) => {
    //       reject(err)
    //     })
    // })
  }


  async getAllEntries(){
    try {
      var result = await this.pdb.allDocs({
        include_docs: true,
        attachments: true
      })
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async getEntry(key) {
    try {
      var result = await this.pdb.get(key)
      return result
    } catch (err) {
      console.log(err);
    }

  }

  insertOrUpdate(doc) {
    return new Promise((resolve, reject) => {
      this.pdb.get(doc._id, {include_docs: true})
      .then((_doc) => {
          doc._rev = _doc._rev
          resolve(this.pdb.put(doc))
      })
      .catch((err) => {
          resolve(this.pdb.put(doc))
      })
    })
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
