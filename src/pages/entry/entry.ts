import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EntryService } from "../../providers/entry-service"
import { DatabaseService } from "../../providers/database-service"
import { LanguageService } from "../../providers/language-service"
import { Observable } from "rxjs/Observable";


@IonicPage({
  name: "entry",
  segment: "entry/:id",
  defaultHistory: ["Home"]
})
@Component({
  selector: 'page-entry',
  templateUrl: 'entry.html',
})
export class Entry {

  entriesIndex$: Observable<any>
  entriesIndex: any
  entry: any
  id: string
  nextId: any
  index: number
  search: boolean = false

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public entryService: EntryService,
    public languageService: LanguageService,
    public databaseService: DatabaseService,
    public cd: ChangeDetectorRef
    ) {
  }

  async ngOnInit() {
    console.log(this.navParams.data)
    this.id = this.navParams.data.id

    // get the entry
    // 

    this.databaseService.getFromPouch(this.id).then((res)=>{
      console.log(res)
      this.entry = res
    })



    // this.nextId = this.navParams.data.nextId
    // this.search = this.navParams.data.search
    

    // if (! this.search) {
    //   this.entryService.entriesIndex$.subscribe( (data) => this.entriesIndex = data )
    // }
    
  }


  ionViewDidEnter() {
    // Reduce the nav stack so back returns to the wordlist
    if ((! this.search) && (this.navCtrl.length() > 3)) this.navCtrl.removeView(this.navCtrl.getPrevious(), {})
  }


  // Track swipes
  swipeEvent(event) {
    if (this.search) return
    if (event.direction == 2) this.next()
    if (event.direction == 4) this.prev()
  }

  // page nav buttons
  prev() {
    this.goToEntry("back")
  }
  next() {
    this.goToEntry("forward")
  }

  goToEntry(direction) {

    // let entryIndex = this.entriesIndex.findIndex(x => x.key === this.entry.key)
    // if (direction=="back") {
    //   --entryIndex
    // } else {
    //   ++entryIndex
    // }

    // // get the next entry now
    // let nextEntry = this.entryService.getEntry(nextId.key)
    // let options = {nextId: nextId, entry: nextEntry}
    // this.navCtrl.push('Entry', options, {animation: "ios-transition", direction: direction})
  }


}
