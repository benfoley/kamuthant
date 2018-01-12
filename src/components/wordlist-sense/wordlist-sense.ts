import { Component, Input } from '@angular/core';

@Component({
  selector: 'wordlist-sense',
  templateUrl: 'wordlist-sense.html'
})
export class WordlistSenseComponent {

  @Input() senses: any

  constructor() {
  }

  strip(source) {
    let regex = /(<([^>]+)>)/ig
    let res = source.replace(regex, "")
    return res
  }
}
