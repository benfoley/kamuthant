import { Component } from '@angular/core';
import { style, animate, transition, trigger } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';

import { EntryService } from "../../providers/entry-service"
import { ConnectivityService } from "../../providers/connectivity-service"
// import { LanguageChooser } from "../../components/language-chooser/language-chooser.module"
import { LanguageService } from '../../providers/language-service'
import { SyncService } from '../../providers/sync-service'
import { Observable } from "rxjs/Observable";


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

  // isLoading: boolean = true // todo - change this to sync service observable
  lettersLoading$: Observable<any>
  // lettersLoaded$: Observable<any>
  status$: Observable<any>
  // entriesIndex$: Observable<any>


  languageCode: string
  entriesIndex: any
  letters: any = []
  entriesIndexSub: any
  languageCodeSub: any
  isMobile: any

  constructor(
    public navCtrl: NavController,
    public connectivityService: ConnectivityService,
    public entryService: EntryService,
    public languageService: LanguageService,
    public syncService: SyncService,
    public platform: Platform,
  ) {
    this.isMobile = this.platform.is('mobile') 
    this.lettersLoading$ = this.syncService.lettersLoading$
    this.status$ = this.connectivityService.onlineSubject

    this.entriesIndexSub = this.entryService.entriesIndex$.subscribe((index) => {
      this.entriesIndex = index
      this.updateLetters()
    })

    this.languageCodeSub = this.languageService.languageCode$.subscribe((code) => {
      this.languageCode = code
      this.updateLetters()
    })
    // do this on pull-to-refresh too
    this.syncService.syncCheck()

  }

  updateLetters() {
    if (this.entriesIndex && this.languageCode) {
      this.letters = []
      for (let i in this.entriesIndex[this.languageCode] ){
        if (this.letters.indexOf(i) === -1 ) this.letters.push(i)
      }
      this.letters.sort()
    }
  }

  ngOnDestroy() {
    this.entriesIndexSub.unsubscribe()
    this.languageCodeSub.unsubscribe()
  }

  gotoAbout() {
    this.navCtrl.push('About')
  }

  gotoSearch() {
    this.navCtrl.push('Search')
  }

  gotoWordlist(letter) {
    this.navCtrl.push('words', {letter:letter})
  }
}
