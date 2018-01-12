import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Wordlist } from './wordlist';
import { ComponentsModule } from '../../components/components.module'
import { VirtualScrollModule } from 'angular2-virtual-scroll';

@NgModule({
  declarations: [
    Wordlist,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(Wordlist),
    VirtualScrollModule,
  ],
  exports: [
    Wordlist
  ]
})
export class WordlistModule {}
