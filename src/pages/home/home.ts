import { Component } from '@angular/core';
import { style, animate, transition, trigger } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Observable } from "rxjs/Observable";

import { DatabaseService } from "../../providers/database-service"
import { EntryService } from "../../providers/entry-service"
import { ConnectivityService } from "../../providers/connectivity-service"
import { SyncService } from "../../providers/sync-service"
import { LanguageChooser } from "../../components/language-chooser/language-chooser.module"


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

  isLoading: boolean = true
  lettersLoading$: Observable<any>
  lettersLoaded$: Observable<any>
  lettersLoadingSub: any
  status$: Observable<any>

  constructor(
    public navCtrl: NavController,
    public connectivityService: ConnectivityService,
    public databaseService: DatabaseService,
    public entryService: EntryService,
    public syncService: SyncService,
  ) {
  }

  ngOnInit() {
    this.lettersLoading$ = this.syncService.lettersLoading$
    this.lettersLoadingSub = this.syncService.lettersLoading$.subscribe( (letters) => {
      this.isLoading = (letters.length > 0) ? true : false
    })
    this.lettersLoaded$  = this.syncService.lettersLoaded$
    this.status$ = this.connectivityService.onlineSubject
  }

  ngOnDestroy() {
    this.lettersLoadingSub.unsubscribe()
  }

  gotoAbout() {
    this.navCtrl.push('About')
  }

  gotoSearch() {
    this.navCtrl.push('Search')
  }

  gotoWordlist(letter) {
    // this.entryService.setLetter(letter)
    this.navCtrl.push('words', {letter:letter})
  }

  // status() {
  //   return this.connectivityService.isOnline()
  // }
}
