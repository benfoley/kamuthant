import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/BehaviorSubject"


@Injectable()
export class LanguageService {

  _languages$: BehaviorSubject<any> = new BehaviorSubject({})
  _language$: BehaviorSubject<any> = new BehaviorSubject({})
  _languageCode$: BehaviorSubject<any> = new BehaviorSubject('')
  languages: any
  _letter$: BehaviorSubject<any> = new BehaviorSubject({})

  constructor() {
    this.languages = [
      { "code":"LANG", "name": "Language", "sortKey":"lx" },
      { "code":"ENG", "name": "English",   "sortKey":"def" }
    ]
    this.setLanguage(this.languages[0])
  }

  get languages$() {
    return this._languages$.asObservable()
  }
  get language$() {
    return this._language$.asObservable()
  }
  get languageCode$() {
    return this._languageCode$.asObservable()
  }
  get letter$() {
    return this._letter$.asObservable()
  }

  setLetter(letter) {
    this._letter$.next(letter)
    console.log("set letter")
  }

  setLanguage(language) {
    this.languages.map((l) => l.selected=false)
    this.languages.map((l) => {
      if (language==l) {
        l.selected=true
        this._languageCode$.next(l.code)
      }
    })
    this._languages$.next(this.languages)
    this._language$.next(language)
  }

  getSelectedLanguage() {
    for (let language of this.languages) {
      if (language.selected===true) return language
    }
  }
}
