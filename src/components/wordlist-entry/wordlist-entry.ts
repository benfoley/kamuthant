import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { EntryService } from "../../providers/entry-service"


@Component({
  selector: 'wordlist-entry',
  templateUrl: 'wordlist-entry.html'
})
export class WordlistEntry {

  @Input() sortKey: any;
  @Input() entry: any;

  image: any

  constructor(
    public navCtrl: NavController,
    public entryService: EntryService,
    ) {
  }

  ngOnInit() {
  }


}
