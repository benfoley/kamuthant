import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AttachmentService } from "../../providers/attachment-service"
import { DatabaseService } from "../../providers/database-service"
import { EntryService } from "../../providers/entry-service"
import { LanguageService } from "../../providers/language-service"
import { Observable } from "rxjs/Observable";

import { Howl } from 'howler'


@IonicPage({
  name: "entry",
  segment: "entry/:id",
  defaultHistory: ["Home"]
})
@Component({
  selector: 'page-entry',
  templateUrl: 'entry.html',
})
export class Entry {

  entriesIndex$: Observable<any>
  entriesIndex: any
  content: any

  id: string
  nextId: any
  index: number
  search: boolean = false
  adjacentIds: any

  lang: any
  letter: any
  searchTerm: string

  loadingAudio: boolean = false
  blobReady: boolean = false
  howler: any
  blob: any
  entry: any

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public entryService: EntryService,
    public languageService: LanguageService,
    public databaseService: DatabaseService,
    public attachmentService: AttachmentService,
    public cd: ChangeDetectorRef,
    ) {
    this.id = this.navParams.data.id
    this.searchTerm = this.navParams.data.searchTerm
    this.adjacentIds = {back: false, forward: false}
  }

  async ngOnInit() {

    // get the entry
    let res = await this.entryService.getEntry(this.id)
    console.log(res)
    this.entry = res
    this.content = res.data

    // set up page nav
    this.lang = await this.languageService.getSelectedLanguage()
    if (this.lang.code=='ENG') {
      this.letter = this.entryService.getInitial( this.entryService.flattenSenses(this.content) ) 
    } else {
      this.letter = this.content.initial
    }
    if (!this.searchTerm) {
      this.adjacentIds = await this.entryService.getAdjacentIdsInIndex(this.lang.code, this.letter, this.id)
    }

    // dodgy warning: hard-wired for single audio entry here for now!
    let blob
    if (this.entry._attachments) {
      blob = this.getFirstBlob(this.entry._attachments)
      this.preparePlayer(blob)
    } else if (this.entry.data.assets) {
      this.loadingAudio = true
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
    let url = URL.createObjectURL( this.blob )
    this.howler = new Howl({
      src: [url],
      format: ['mp3']
    })
  }

  play() {
    if (this.howler) this.howler.play()
  }



  ionViewDidEnter() {
    // Reduce the nav stack so back returns to the wordlist
    // Might need to change this to get swiping to work
    // if ((! this.search) && (this.navCtrl.length() > 3)) this.navCtrl.removeView(this.navCtrl.getPrevious(), {})
  }
  ionViewWillEnter() {
    this.navCtrl.swipeBackEnabled=false
  }

  ionViewWillLeave() {
    this.navCtrl.swipeBackEnabled=true
  }






  swipeEvent(event) {
    if (this.searchTerm) return
    if (event.direction == 2) this.next()
    // let's use the built-in back swiping functionality
    if (event.direction == 4) this.prev()
  }

  // this is just for the back button
  prev() {
    // this.navCtrl.pop()
    if (this.adjacentIds.back) this.goToEntry("back")
    else this.gotoWordlist("back")
  }

  // forward button or swipe
  next() {
    if (this.adjacentIds.forward) this.goToEntry("forward")
    else this.gotoWordlist("forward")
  }

  gotoWordlist(direction) {
    let paramOptions = {letter: this.letter}
    let animationOptions = {animate: true, direction: direction}
    this.navCtrl.setRoot('words', paramOptions, animationOptions)
  }
  gotoSearch() {
    let animationOptions = {animate: true, direction: "back"}
    this.navCtrl.setRoot('search', {searchTerm: this.searchTerm}, animationOptions)
  }
  
  goToEntry(direction) {
    let options = {id: this.adjacentIds[direction]}
    this.navCtrl.push('entry', options, {animation: "ios-transition", direction: direction})
  }

}
