import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EntryService } from "../../providers/entry-service"
import { LanguageService } from "../../providers/language-service"

import * as Fuse from 'fuse.js';

@IonicPage({
  name: "search",
  segment: "search/:searchTerm",
  defaultHistory: ["Home"]
})
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class Search {

  searchEntries: any = []
  language: any
  letter: string

  entrySub: any
  langSub: any

  noEntries: boolean
  visibility: string = "hidden"

  fuse: any
  searchOptions: any
  searchTerm: string = ''
  parent: string = 'search'

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public entryService: EntryService,
    public languageService: LanguageService
    ) {
  }

  ngOnInit() {
  this.searchTerm = this.navParams.data.searchTerm

  this.searchOptions = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: []}

    this.entrySub = this.entryService.entries$.subscribe( async (entries) => {
      console.log("changed entries", entries)
      this.fuse = new Fuse(entries, this.searchOptions)
      this.doSearch()
    })


    this.langSub = this.languageService.language$.subscribe( async (language) => {
      this.language = language
      this.searchOptions.keys = (language.code=='ENG') ? ["data.engSearch"] : ["data.lx"]
      // should build and persist a search index on inital sync instead of here
      this.entryService.getEntriesForSearch()
    })    
  }


  search(term) {
    this.searchTerm = term
    this.doSearch()
  }
  doSearch() {
    this.searchEntries = this.fuse.search(this.searchTerm)
    console.log(this.searchEntries)
  }

  searchClear() {
    this.searchEntries = []
  }

  gotoHome() {
    let animationOptions = {animate: true, direction: "back"}
    this.navCtrl.setRoot('Home', {}, animationOptions)
  }
}