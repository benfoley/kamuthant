import { Component, ViewChild, ElementRef } from '@angular/core';
import { style, animate, transition, trigger } from '@angular/core';
import { IonicPage, NavController, Platform, LoadingController } from 'ionic-angular';

import { EntryService } from "../../providers/entry-service"
import { DatabaseService } from '../../providers/database-service'
import { LanguageService } from '../../providers/language-service'
import { SyncService } from '../../providers/sync-service'
import { Http, ResponseContentType } from '@angular/http'

import { AttachmentService } from "../../providers/attachment-service"
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        // style({opacity:0, height: 0}),
        // animate(500, style({opacity:1, height: "auto"}))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(1000, style({height: 0}))
      ])
    ])
  ]
})
export class Home {

  loading: any
  lettersSub: any
  letters: string[]
  lettersAll: any
  languageCodeSub: any
  languageCode: string

  logMessages: string[] = ["log"]
  sound: any
  blob: any

  constructor(
    public http: Http,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public attachmentService: AttachmentService,
    public databaseService: DatabaseService,
    public entryService: EntryService,
    public languageService: LanguageService,
    public syncService: SyncService,
  ) {
    this.loading = this.loadingCtrl.create({
      content: 'checking data'
    })
    this.languageCodeSub = this.languageService.languageCode$.subscribe((code) => {
      this.languageCode = code
      this.updateLettersUi()
    })
    this.lettersSub = this.entryService.letters$.subscribe((letters) => {
      this.lettersAll = letters
      this.updateLettersUi()
    })
  }

  ngOnDestroy() {
    this.languageCodeSub.unsubscribe()
    this.lettersSub.unsubscribe()
  }

  async ngOnInit() {
    try {
      await this.entryService.getLetters()
    } catch (err) {
      console.log('H could not get letters')
    }
  }

  updateLettersUi() {
    if (this.lettersAll && this.languageCode) this.letters = this.lettersAll[this.languageCode].sort()
    else this.letters = []
  }

  async doRefresh(refresher) {
    console.log('do refresh')
    this.loading.present()
    try {
      await this.syncService.sync()
    } catch (err) {
      console.log('doRefresh error', err)
    }
    this.loading.dismiss()
    refresher.complete()
  }

  gotoAbout() {
    this.navCtrl.push('about')
  }

  gotoSearch() {
    this.navCtrl.push('search', {searchTerm:''})
  }

  gotoWordlist(letter) {
    this.navCtrl.push('words', {letter:letter})
  }
}
