import { Injectable } from '@angular/core';
import { DomSanitizer, SafeStyle, SafeUrl } from '@angular/platform-browser'
import { Platform } from 'ionic-angular'
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';

import firebase from 'firebase'

@Injectable()
export class AttachmentService {

  path: any


  constructor(
    private sanitizer: DomSanitizer,
    public platform: Platform,
    private transfer: Transfer,
    private file: File
    ) {
    this.path = 'cdvfile://localhost/persistent/'
  }

  saveAttachments(entries) {
    console.log('saveAttachments')
    // only save media if we are on a device
    // if (this.platform.is('core')) return

    entries.forEach( (entry) => {
      if ((entry.assets) && (entry.assets.audio)) this.prepareFiles(entry.assets.audio)
      if ((entry.assets) && (entry.assets.images)) this.prepareFiles(entry.assets.images)
    })

  }

  prepareFiles(assets) {
    console.log('prepareFiles')
    // console.log(assets)
    assets.forEach((asset) => {
      this.file.checkFile(this.path, asset.id)
        .then((exists) => {
          console.log('check file: exists')
          // resolve the data directory first, then resolve the file
          this.file.resolveDirectoryUrl(this.path)
          .then( (dirEntry) => {
              this.file.getFile(dirEntry, asset.id, {})
              .then((entry) => {
                asset.path = entry.toURL()
                console.log('asset')
                console.log(asset)
              })
          })
        })
        .catch((err) => {
          console.log('check file: does not exist')
          this.downloadFile(asset.type, asset)
        })
    })
  }

  downloadFile(type, asset) {
    console.log('downloadFile')
    firebase.storage().ref(type).child(asset.id).getDownloadURL()
    .then((url) => {
      console.log('got download URL', url)
      if (this.platform.is('core')) {
      // browser
        asset.path = url
        return
      } else {
        // device
        let fileTransfer: TransferObject = this.transfer.create()
        fileTransfer.download(url, this.path + asset.id)
          .then((entry) => {
            console.log('download complete: ' + entry.toURL())
            asset.path = entry.toURL()
          }, (error) => {
            console.log("error doing file transfer", error)
          })
      }
    })
    .catch((err) => {
      console.log("error getting from firebase", err)
    })
  }

}
