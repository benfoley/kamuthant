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
    console.log("WordlistEntry ngAfterViewInit")
      
    this.content = this.entry.data
    await this.groupAttachments()
    this.prepareAudio()
  }

  async groupAttachments() {
    this.audios = []
    this.images = []
    for (let i in this.entry._attachments) {
      let att = this.entry._attachments[i]
      if (att.content_type=="audio/wav") {
        this.audios.push(att)
      }
      if (att.content_type=="image/jpeg") {
        this.images.push(this.blobToUrl(att.data))
      }
    }
    return 
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

  blobToUrl(blob) {
    return URL.createObjectURL(blob)
  }

  play() {
    console.log("playing")
    this.wavesurfer.play()
  }

  goToEntry(entry) {
    this.navCtrl.push('entry', {id: entry.id})
  }
}
