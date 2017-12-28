import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from "rxjs/Observable";
import { DatabaseService } from "../../providers/database-service"
import { EntryService } from "../../providers/entry-service"
import { LanguageService } from "../../providers/language-service"


@IonicPage({
  name: "words",
  segment: "words/:letter",
  defaultHistory: ["Home"]
})
@Component({
  selector: 'page-wordlist',
  templateUrl: 'wordlist.html',
})
export class Wordlist {

  isLoading: boolean = true
  letter: string
  entries: any = []
  language: any

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public databaseService: DatabaseService,
    public entryService: EntryService,
    public languageService: LanguageService,
    ) {
  }

  ngOnInit() {
    
    // Get the letter from nav params
    this.letter = this.navParams.data.letter

    this.entryService.entries$.subscribe((entries) => {
      if (Array.isArray(entries)) this.entries = entries
    })

    this.languageService.language$.subscribe((language) => {
      this.language = language
      if (this.letter) this.entryService.getEntriesByLetter(this.letter)
    })
  }

  ngOnDestroy() {
  }

  goToEntry(entry) {
    let options = {entry:entry}
    this.navCtrl.push('Entry', options)
  }
}
