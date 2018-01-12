import { Component, ViewChild, Pipe } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { DatabaseService } from "../../providers/database-service"
import { EntryService } from "../../providers/entry-service"
import { LanguageService } from "../../providers/language-service"
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators/debounceTime';

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
  searchIndexSub: any
  langSub: any

  noEntries: boolean
  loading: boolean = true

  fuse: any
  searchOptions: any
  searchTerm: string = ''
  parent: string = 'search'
  entries: any
  searchIndex: any

  searchControl: FormControl;

  @ViewChild(Content) content: Content;

  constructor(

    public navCtrl: NavController,
    public navParams: NavParams,
    public databaseService: DatabaseService,
    public entryService: EntryService,
    public languageService: LanguageService
    ) {
    this.searchControl = new FormControl()
  }

  async ngOnInit() {
    if (this.navParams.data.searchTerm) {
      this.searchTerm = this.navParams.data.searchTerm
    } else {
      try {
        this.searchTerm = await this.databaseService.getConfig("searchTerm")  
      } catch (err) {
        this.searchTerm = ''
      }
    }
    if (this.searchTerm == '') this.loading = false

    this.searchOptions = {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 3,
      keys: ["doc.data.engSearch", "doc.data.lx"]
    }


    // this.searchIndexSub = this.entryService.searchIndex$.subscribe( async (searchIndex) => {
    //   console.log('got search index', searchIndex)
    //   this.searchIndex = searchIndex
    //   this.search()
    // })


    this.langSub = this.languageService.language$.subscribe( async (language) => {
      this.language = language
      console.log('got language', language.code)
      // could weight different language options depending on which is selected
      // this.searchOptions.keys = (language.code=='ENG') ? ["engSearch"] : ["langSearch"]
      // this.entryService.getSearchIndex()
    })

    console.log('get all entries')
    this.entries = await this.databaseService.getAllEntries()
    console.log('all entries', this.entries)
    if (this.searchTerm != '') this.search()
  }

  ngOnDestroy() {
    // this.searchIndexSub.unsubscribe()
    this.langSub.unsubscribe()
  }


  ionViewDidLoad() {
    this.searchControl.valueChanges.pipe(
        debounceTime(700)
    ).subscribe(search => {
      this.search()
    })
  }


  async search() {
    console.log(this.searchTerm)
    if (this.entries) {
      this.fuse = new Fuse(this.entries.rows, this.searchOptions)
      this.searchEntries = this.fuse.search(this.searchTerm)
      this.loading = false
    }
  }

  searchClear() {
    this.searchTerm = ''
    this.saveSearchTerm()
  }

  gotoHome() {
    let animationOptions = {animate: true, direction: "back"}
    this.navCtrl.setRoot('Home', {}, animationOptions)
    this.saveSearchTerm()
  }

  async saveSearchTerm() {
    try {
      let index = {"_id": "searchTerm", "data": this.searchTerm}      
      await this.databaseService.insertOrUpdateConfig(index)
    } catch(err) {
      console.log("couldn't save search term")
    }    
  }
}