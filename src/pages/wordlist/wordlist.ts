import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from "rxjs/Observable";
import { DatabaseService } from "../../providers/database-service"
import { EntryService } from "../../providers/entry-service"
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

  isLoading: boolean = true
  letter: string
  entries: any = []
  language: any
  visibility: string = "hidden"

  entrySub: any
  langSub: any

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

    this.entrySub = this.entryService.entries$.subscribe((entries) => {
      if (Array.isArray(entries)) this.entries = entries
    })

    this.langSub = this.languageService.language$.subscribe( async (language) => {
      this.visibility = "hidden"

      this.language = language
      this.letter = this.navParams.data.letter

      if (this.letter) await this.entryService.getEntriesByLetter(this.letter)
      
      setTimeout(() => {
        this.visibility = "visible"  
      }, 500)
      

    })
  }

  ngOnDestroy() {
    this.entrySub.unsubscribe()
    this.langSub.unsubscribe()
  }

  goToEntry(entry) {
    let options = {entry:entry}
    this.navCtrl.push('Entry', options)
  }
}
