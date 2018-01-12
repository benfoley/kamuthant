import { Component } from '@angular/core';
import { LanguageService } from "../../providers/language-service"
import { Observable } from "rxjs/Observable";


@Component({
  selector: 'language-chooser',
  templateUrl: 'language-chooser.html'
})
export class LanguageChooser {

  languages$: Observable<any>

  constructor(public languageService: LanguageService) {
    this.languages$ = this.languageService.languages$
  }

  setLanguage(language) {
    console.log("pressed lang select")
    this.languageService.setLanguage(language)
  }

}
