import { Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EntryService } from "../../providers/entry-service"
import { DatabaseService } from "../../providers/database-service"
import { LanguageService } from "../../providers/language-service"
import { Observable } from "rxjs/Observable";

import WaveSurfer from 'wavesurfer.js'


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

  @ViewChild("waveform") waveform: ElementRef


  entriesIndex$: Observable<any>
  entriesIndex: any
  content: any
  wavesurfer: any
  audios: any = []
  images: any = []
  id: string
  nextId: any
  index: number
  search: boolean = false
  adjacentIds: any

  lang: any
  letter: any
  searchTerm: string

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public entryService: EntryService,
    public languageService: LanguageService,
    public databaseService: DatabaseService,
    public cd: ChangeDetectorRef,

    ) {
    this.id = this.navParams.data.id
    this.searchTerm = this.navParams.data.searchTerm
    this.adjacentIds = {back: false, forward: false}
    console.log("ENTRY this.searchTerm", this.searchTerm)
  }

  async ngOnInit() {

    // get the entry
    let res = await this.entryService.getEntry(this.id)
    this.content = res.data

    // get attachments
    let attachments = await this.entryService.groupAttachments(res._attachments)
    this.audios = attachments.audios
    this.images = attachments.images

    // set up audio
    this.prepareAudio()

    // set up page nav
    this.lang = await this.languageService.getSelectedLanguage()
    if (this.lang.code=='ENG') {
      this.letter = this.entryService.getInitial( this.entryService.flattenSenses(this.content) ) 
    } else {
      this.letter = this.entryService.getInitial( this.content.lx )
    }
    this.adjacentIds = await this.entryService.getAdjacentIdsInIndex(this.lang.code, this.letter, this.id)

  }



  prepareAudio() {
    if (this.audios.length > 0){
      let blob = this.audios[0].data
      this.wavesurfer = WaveSurfer.create({
        container: '#waveform',
        height:0
      })
      // WaveSurfer with iOS Safari doesn't like loading blob, so use a buffer instead
      let fileReader = new FileReader();
      fileReader.onload = (event:any) => {
          this.wavesurfer.loadArrayBuffer(event.target.result)
      };
      fileReader.readAsArrayBuffer(blob);
    }    
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

  play() {
    this.wavesurfer.play()
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
    else this.gotoWordlist()
  }

  // forward button or swipe
  next() {
    if (this.adjacentIds.forward) this.goToEntry("forward")
    else this.gotoWordlist()
  }

  gotoWordlist() {
    let paramOptions = {letter: this.letter}
    let animationOptions = {animate: true, direction: "back"}
    this.navCtrl.setRoot('words', paramOptions, animationOptions)
  }
  gotoSearch() {
    let animationOptions = {animate: true, direction: "back"}
    this.navCtrl.setRoot('search', {searchTerm: this.searchTerm}, animationOptions)
  }
  
  goToEntry(direction) {
    let options = {id: this.adjacentIds[direction].id}
    this.navCtrl.push('entry', options, {animation: "ios-transition", direction: direction})
  }

}
