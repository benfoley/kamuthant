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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public entryService: EntryService,
    public languageService: LanguageService,
    public databaseService: DatabaseService,
    public cd: ChangeDetectorRef
    ) {
    this.adjacentIds = {back: false, forward: false}
  }

  async ngOnInit() {
    this.id = this.navParams.data.id




    // get the entry
    // 

    let res = await this.entryService.getEntry(this.id)
    this.content = res.data
    let attachments = await this.entryService.groupAttachments(res._attachments)
    console.log(attachments)
    this.audios = attachments.audios
    this.images = attachments.images
    this.prepareAudio()
    this.getAdjacentIds()

    // this.search = this.navParams.data.search
    // if (! this.search) {
    //   this.entryService.entriesIndex$.subscribe( (data) => this.entriesIndex = data )
    // }
  }

  ionViewDidLoad() {
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
  async getAdjacentIds() {
    console.log("get adjacent ids")
    // discover what our selected letter is!
    let lang = this.languageService.getSelectedLanguage()
    let char
    if (lang.code=='ENG') {
      char = this.entryService.getInitial( this.entryService.flattenSenses(this.content) ) 
    } else {
      char = this.entryService.getInitial( this.content.lx )
    }
    this.adjacentIds = await this.entryService.getAdjacentIdsInIndex(lang.code, char, this.id)
    console.log(this.adjacentIds)
  }

  ionViewDidEnter() {
    // Reduce the nav stack so back returns to the wordlist
    if ((! this.search) && (this.navCtrl.length() > 3)) this.navCtrl.removeView(this.navCtrl.getPrevious(), {})
  }


  play() {
    console.log("playing")
    this.wavesurfer.play()
  }

  // Track swipes
  swipeEvent(event) {
    if (this.search) return
    if (event.direction == 2) this.next()
    if (event.direction == 4) this.prev()
  }

  // page nav buttons
  prev() {
    this.goToEntry("back")
  }
  next() {
    this.goToEntry("forward")
  }

  async goToEntry(direction) {


    console.log("nextId", this.adjacentIds)
    if (this.adjacentIds[direction]) {
        let options = {id: this.adjacentIds[direction].id}
        this.navCtrl.push('entry', options, {animation: "ios-transition", direction: direction})
      }
    }

}
