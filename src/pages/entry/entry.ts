import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EntryService } from "../../providers/entry-service"
import { LanguageService } from "../../providers/language-service"
import { Observable } from "rxjs/Observable";


@IonicPage()
@Component({
  selector: 'page-entry',
  templateUrl: 'entry.html',
})
export class Entry {

  entriesIndex$: Observable<any>
  entriesIndex: any
  entry: any
  item: any
  index: number
  search: boolean = false

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public entryService: EntryService,
    public languageService: LanguageService
    ) {
  }

  ngOnInit() {
    this.entry = this.navParams.data.entry
    this.item = this.navParams.data.item
    this.search = this.navParams.data.search
    
    // if (! this.search) {
    //   this.entryService.entriesIndex$.subscribe( (data) => this.entriesIndex = data )
    //   this.getIndex()
    // }
    
  }

  ionViewDidEnter() {
    // Reduce the nav stack so back returns to the wordlist
    if ((! this.search) && (this.navCtrl.length() > 3)) this.navCtrl.removeView(this.navCtrl.getPrevious(), {})
  }

  getIndex() {
    this.index = this.entriesIndex.findIndex(x => x.key === this.entry.key)
  }


  // Track swipes
  swipeEvent(event) {
    if (this.search) return
    if (event.direction == 2) this.next()
    if (event.direction == 4) this.prev()
  }

  // page nav buttons

  prev() {
    // --this.index
    // this.goToEntry("back")
  }
  next() {
    // ++this.index
    // this.goToEntry("forward")
  }

  goToEntry(direction) {
    // get the next item in the index
    // let item = this.entriesIndex[this.index]
    // get the full entry now
    // let entry = this.entryService.getEntry(item.key)
    // let options = {item:item, entry:entry}
    // this.navCtrl.push('Entry', options, {animation:"ios-transition", direction:direction})
  }


}
