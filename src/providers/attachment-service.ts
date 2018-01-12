import { Injectable } from '@angular/core'
import { Http, ResponseContentType } from '@angular/http'

import firebase from 'firebase'

@Injectable()
export class AttachmentService {

  constructor(
    ) {
  }

  async download(asset, done) {
    return new Promise(async(resolve, reject) => {
      let url = await firebase.storage().ref(asset.type).child(asset.id).getDownloadURL()
      fetch(url).then((response)=> {
        console.log('fetch response', response)
        response.blob().then((blob) => {
          console.log('fetch blob', blob)
          resolve(blob)
        })
      })
      .catch((err) => reject(err))
    })
  }

}
