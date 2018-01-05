import { Component, ViewChild, AfterViewInit, ElementRef, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { EntryService } from "../../providers/entry-service"

import WaveSurfer from 'wavesurfer.js'
import toBuffer from 'blob-to-buffer'


@Component({
  selector: 'wordlist-entry',
  templateUrl: 'wordlist-entry.html'
})
export class WordlistEntry implements AfterViewInit {

  @Input() sortKey: any;
  @Input() entry: any;
  @Input() attachments: any;

  @ViewChild("waveform") waveform: ElementRef

  image: any
  wavesurfer: any
  // attachments: any = []
  audios: any = []

  constructor(
    public navCtrl: NavController,
    public entryService: EntryService,
    ) {
    console.log("WordlistEntry")
  }

  async ngOnInit() {
    console.log(this.entry)
    console.log(this.attachments)
    // separate the audio from the images
    for (let i in this.attachments) {
      if (this.attachments[i].content_type=="audio/wav") {
        this.audios.push(this.attachments[i])
      }
    }

  }

  async ngAfterViewInit() {

    if (this.audios.length > 0){
      let blob = this.audios[0].data

      this.wavesurfer = WaveSurfer.create({
        container: '#waveform',
        height:100
      })
      // WaveSurfer with iOS Safari doesn't like loading blob, so use a buffer instead
      let fileReader = new FileReader();
      fileReader.onload = (event:any) => {
          this.wavesurfer.loadArrayBuffer(event.target.result)
      };
      fileReader.readAsArrayBuffer(blob);

    }
  }

  play() {
    console.log("playing")
    this.wavesurfer.play()
  }

  goToEntry(entry) {
    this.navCtrl.push('entry', {id: entry.id})
  }
}
