import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AttachmentService } from "../../providers/attachment-service"
import { DatabaseService } from "../../providers/database-service"
import { EntryService } from "../../providers/entry-service"

import { Howl } from 'howler'


@Component({
  selector: 'wordlist-entry',
  templateUrl: 'wordlist-entry.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordlistEntry {

  @Input() entry: any;
  @Input() searchTerm: any;
  @Input() templateLang: any;

  loadingAudio: boolean = false
  blobReady: boolean = false
  howler: any
  blob: any

  constructor(
    public navCtrl: NavController,
    public entryService: EntryService,
    public databaseService: DatabaseService,
    public attachmentService: AttachmentService,
    private ref: ChangeDetectorRef,
    ) {
  }

  async ngOnInit() {
    this.entry = await this.entryService.getEntry(this.entry.data.id)
   
    // dodgy warning: hard-wired for single audio entry here for now!
    let blob
    if (this.entry._attachments) {
      blob = this.getFirstBlob(this.entry._attachments)
      this.preparePlayer(blob)
    } else if (this.entry.data.assets) {
      this.loadingAudio = true
      this.ref.markForCheck()
      let blob:any = await this.attachmentService.download(this.entry.data.assets.audio[0], (err,res) => {if(err) console.log(err); return res}) 
      this.preparePlayer(blob)
      let attachments = {}
      attachments[this.entry.data.assets.audio[0].id] = {
        content_type: blob.type,
        data: blob
      }
      let doc = {"_id":this.entry.data.id, "data":this.entry.data, "_attachments":attachments}
      let res = await this.entryService.saveEntry(doc)
    } else {
      console.log('eek', this.entry)
    }
  }

  getFirstBlob(attachments) {
    let kyz = Object.keys(attachments)
    if (kyz.length > 0) {
      let name = kyz[0]
      return attachments[name].data
    } else {
      return false
    }
  }

  preparePlayer(blob) {
    console.log('preparePlayer')
    this.blob = blob
    this.loadingAudio = false
    this.blobReady = true
    this.ref.markForCheck()
    let url = URL.createObjectURL( this.blob )
    this.howler = new Howl({
      src: [url],
      format: ['mp3']
    })
  }

  play() {
    if (this.howler) this.howler.play()
  }

  goToEntry(id) {
    this.navCtrl.push('entry', {id: id, searchTerm: this.searchTerm})
    try {
      let index = {"_id": "searchTerm", "data": this.searchTerm}      
      this.databaseService.insertOrUpdateConfig(index)
    } catch(err) {
      console.log("couldn't save search term")
    }
  }
}
