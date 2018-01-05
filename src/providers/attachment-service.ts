import { Injectable } from '@angular/core'
import { Http, ResponseContentType } from '@angular/http'
import { EntryService } from "./entry-service"

import 'rxjs/add/operator/map'
import firebase from 'firebase'

@Injectable()
export class AttachmentService {

  path: any
  blobs: any

  constructor(
    public entryService: EntryService,
    public http: Http,
    ) {
  }

  // Pouch doesn't seem to handle attachments organised in groups, 
  // so we need to flatten our image/audio groups into a single array
  async saveAttachments(entry) {
    this.blobs = []

    let imagePromises = entry.assets.images.map((asset)=>this.download(entry.id, asset))
    let audioPromises = entry.assets.audio.map((asset)=>this.download(entry.id, asset))
    let promises = imagePromises.concat(audioPromises)

    // get the attachments
    await Promise.all(promises)
      .then((blobs:any) => {
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
            resolve(data)
          }) //subscribe
        }) //then
    })// promise
  }

}
