import { Component, ViewChild, AfterViewInit, ElementRef, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { EntryService } from "../../providers/entry-service"

import WaveSurfer from 'wavesurfer.js'

@Component({
  selector: 'wordlist-entry',
  templateUrl: 'wordlist-entry.html'
})
export class WordlistEntry implements AfterViewInit {

  @Input() sortKey: any;
  @Input() entry: any;

  @ViewChild("waveform") waveform: ElementRef

  image: any
  wavesurfer: any

  constructor(
    public navCtrl: NavController,
    public entryService: EntryService,
    ) {
    console.log("WordlistEntry")
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit")
    console.log(WaveSurfer)

      let audiofile = 'https://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3';

      this.wavesurfer = WaveSurfer.create({
        container: '#waveform',
        height:100
      })
      
      this.wavesurfer.load(audiofile)
      
      this.wavesurfer.on('ready', () => {
          console.log("wavesurfer is ready")
          this.wavesurfer.play()
      })
  }

}
