import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Content } from 'ionic-angular';
import { EntryService } from "../../providers/entry-service"
import { DatabaseService } from "../../providers/database-service"
import { LanguageService } from "../../providers/language-service"
import { trigger, state, style, animate, transition } from '@angular/animations';


@IonicPage({
  name: "words",
  segment: "words/:letter",
  defaultHistory: ["Home"]
})
@Component({
  selector: 'page-wordlist',
  templateUrl: 'wordlist.html',
  animations: [
    trigger('visibilityChanged', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('visible => hidden', animate('0ms')),
      transition('hidden => visible', animate('100ms ease-out'))
    ])
  ]
})
export class Wordlist {

  entries: any = []
  language: any
  letter: string

  langSub: any
  entriesSub: any

  noEntries: boolean
  visibility: string = "hidden"

  templateLang: string


  @ViewChild(Content) content: Content;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public entryService: EntryService,
    public databaseService: DatabaseService,
    public languageService: LanguageService,
    public loadingCtrl: LoadingController,
    ) {
    this.letter = this.navParams.data.letter
    this.languageService.setLetter(this.navParams.data.letter)

    this.langSub = this.languageService.language$.subscribe((language) => {
      console.log("WL langSub")
      this.visibility = 'hidden'
      this.language = language
      this.getEntries()
    })

    this.entriesSub = this.entryService.entries$.subscribe((entries) => {
      this.entries = entries
      console.log("WL entriesSub", entries)
      setTimeout(() => {
        this.visibility = "visible"  
        this.noEntries = (this.entries.length==0) ? true : false
      }, 120)
    })

  }

  async getEntries() {
    console.log("WL get entries", this.language.code, this.letter)
    // trigger entry service to publish new set of entries
    this.entryService.getEntriesForLetter(this.letter)
  }

  ngOnDestroy() {
    this.entriesSub.unsubscribe()
    this.langSub.unsubscribe()
  }

  gotoHome() {
    let animationOptions = {animate: true, direction: "back"}
    this.navCtrl.setRoot('Home', {}, animationOptions)
  }
}
