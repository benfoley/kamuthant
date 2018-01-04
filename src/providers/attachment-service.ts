import { Injectable } from '@angular/core'
import { DomSanitizer, SafeStyle, SafeUrl } from '@angular/platform-browser'
import { Platform } from 'ionic-angular'
import { Http, ResponseContentType } from '@angular/http'
import { File } from '@ionic-native/file'
import { EntryService } from "./entry-service"
import { DatabaseService } from './database-service'

import 'rxjs/add/operator/map'
import firebase from 'firebase'

@Injectable()
export class AttachmentService {

  path: any
  blobs: any


  constructor(
    private sanitizer: DomSanitizer,
    public databaseService: DatabaseService,
    public entryService: EntryService,
    private file: File,
    public http: Http,
    public platform: Platform
    ) {
    this.path = 'cdvfile://localhost/persistent/'
  }


  flattenAssetArray(entry) {
    let assets = []
    if (entry.assets.images) {        
      for (let image of entry.assets.images) {
        assets.push(image)
      }
    }
    if (entry.assets.audio) {
      for (let audio of entry.assets.audio) {
        assets.push(audio)
      }
    }
    return assets
  }



  async saveAttachments(entry) {
    console.log("save attachments")
    // build array of assets for easy iteration
    let assets = this.flattenAssetArray(entry)
    this.blobs = []
    console.log("asset array for", entry.lx, assets)
        

    let promises = assets.map((asset)=>this.download(entry.id, asset))

    // get the attachments
    await Promise.all(promises)
      .then((blobs:any) => {
        
        console.log("blobs from promises", blobs)

        // compile attachments for bulk add
        let attachments = {}   
        for(let blob of blobs) {
          attachments[blob.name] = {
            content_type: blob._body.type,
            data: blob.blob()
          }
        }
        // save the entry with attachments
        let doc = {"_id":entry.id, "data":entry, "_attachments":attachments}
        this.entryService.saveEntry(doc)
      })
      .catch((err)=>console.log(err))
  }

  download(entryId, asset) {
    let options = {responseType: ResponseContentType.Blob}

    return new Promise((resolve, reject) => {
      firebase.storage().ref(asset.type).child(asset.id).getDownloadURL()
        .then((url) => {
          
          this.http.get(url, options).subscribe(async(data:any) => {
            data["name"] = asset.id
            // this.blobs.push(data)
            resolve(data)
          }) //subscribe
        }) //then
    })// promise
  }

}
