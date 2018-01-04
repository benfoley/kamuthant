import { Injectable } from '@angular/core';
import { DomSanitizer, SafeStyle, SafeUrl } from '@angular/platform-browser'
import { Platform } from 'ionic-angular'
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file'
import { EntryService } from "./entry-service"

import firebase from 'firebase'

@Injectable()
export class AttachmentService {

  path: any


  constructor(
    private sanitizer: DomSanitizer,
    public platform: Platform,
    private transfer: Transfer,
    private file: File,
    public entryService: EntryService
    ) {
    this.path = 'cdvfile://localhost/persistent/'
  }


  async saveAttachments(entry) {
    console.log("get attachment")
    // build array of assets for easy iteration
    let assets = this.flattenAssetArray(entry)
    // do stuff
    await Promise.all(assets.map(async (asset) => {
      await this.getURL(asset)
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

  async getURL(asset) {
    console.log("get url")
    await firebase.storage().ref(asset.type).child(asset.id).getDownloadURL()
    .then((url) => asset.path = url)
    // await this.timeout(3000)
    console.log(asset.path)
    return asset.path
  }



  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


}
