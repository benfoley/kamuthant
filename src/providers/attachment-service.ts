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


  async saveAttachments(entry) {
    console.log("get attachment")
    // build array of assets for easy iteration
    let assets = this.flattenAssetArray(entry)
    // do stuff
    await Promise.all(assets.map(async (asset) => {
      let url = await this.getURL(entry.id, asset)
      // on a device? download the audio
    }))
    // console.log("done downloads, save entries")
    this.entryService.saveEntry(entry)
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

  async getURL(id, asset) {
    console.log("get url", id, asset.id)
    await firebase.storage().ref(asset.type).child(asset.id).getDownloadURL()
    .then((url) => {
      asset.path = url
      this.download(id, asset)      
    })
    // await this.timeout(3000)
    return asset.path
  }


  download(id, asset) {

    // if we're in the browser, change url to use proxy for CORS issue
    // change to using an app constant instead of this...
    // https://firebasestorage.googleapis.com/v0
    let url = asset.path.replace("https://firebasestorage.googleapis.com/v0", "/v0")

    // set the response so we get type info and size etc
    let options = {responseType: ResponseContentType.Blob}

    this.http.get(url, options)
      .subscribe(async (data:any) => {
        console.log(data)
        // save the attachment to the doc
        try {
          var attachment = {id: asset.id, data: data.blob(), type: data._body.type}
          var result = await this.databaseService.addAttachment(id, attachment)
          console.log(result)
        } catch (err) {
          console.log(err)
        }

      })
  }



  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


}
