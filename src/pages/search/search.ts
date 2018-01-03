import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EntryService } from "../../providers/entry-service"
import { LanguageService } from "../../providers/language-service"
import { Observable } from "rxjs/Observable";


@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Search {

  entriesCount: number = 0
  searchEntries: any = []
  language: any
  languageSub: any

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public entryService: EntryService,
    public languageService: LanguageService,
    public cd: ChangeDetectorRef
    ) {
  }

  ngOnInit() {
    this.languageSub = this.languageService.language$.subscribe( (language) => {
      this.language = language
    })
  }

  search (term) {
    // this.entryService.search(term)
    //   .then((res:any) => {
    //     this.searchEntries = res
    //     this.entriesCount = res.length
    //     this.cd.markForCheck() // Marks path for change detection
    //   })
    //   .catch( (err) => {
    //     this.entriesCount = 0
    //   })
  }

  searchClear () {
    this.searchEntries = []
    this.entriesCount = 0
  }

  goToEntry(entry) {
    let options = {entry:entry, search: true}
    this.navCtrl.push('Entry', options)
  }
}