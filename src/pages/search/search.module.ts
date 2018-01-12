import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Search } from './search';
import { ComponentsModule } from '../../components/components.module'
import { VirtualScrollModule } from 'angular2-virtual-scroll';

@NgModule({
  declarations: [
    Search,
  ],
  imports: [
    ComponentsModule,
    VirtualScrollModule,
    IonicPageModule.forChild(Search),
  ],
  exports: [
    Search
  ]
})
export class SearchModule {}
