import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { EntryService } from "../../providers/entry-service"

import WaveSurfer from 'wavesurfer.js'


@Component({
  selector: 'wordlist-entry',
  templateUrl: 'wordlist-entry.html'
})
export class WordlistEntry {

  @Input() sortKey: any;
  @Input() entry: any;

  @ViewChild("waveform") waveform: ElementRef

  content: any
  wavesurfer: any
  audios: any = []
  images: any = []

  constructor(
    public navCtrl: NavController,
    public entryService: EntryService,
    ) {
  }

  async ngOnChanges() {      
    this.content = this.entry.data
    let attachments = await this.entryService.groupAttachments(this.entry._attachments)
    this.audios = attachments.audios
    this.images = attachments.images
    this.prepareAudio()
  }

  prepareAudio() {
    if (this.audios.length > 0){
      let blob = this.audios[0].data
      this.wavesurfer = WaveSurfer.create({
        container: '#waveform',
        height:0
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
    this.wavesurfer.play()
  }

  goToEntry(entry) {
    this.navCtrl.push('entry', {id: entry.id})
  }
}
