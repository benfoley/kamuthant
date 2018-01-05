import { NgModule } from "@angular/core"
import { IonicModule } from 'ionic-angular';

import { EntrySense } from './entry-sense/entry-sense'
import { LanguageChooser } from './language-chooser/language-chooser'
import { SenseExample } from './sense-example/sense-example'
import { WordlistEntry } from './wordlist-entry/wordlist-entry'

import { PipesModule } from '../pipes/pipes.module'

@NgModule({
  declarations: [
    EntrySense,
    LanguageChooser,
    SenseExample,
    WordlistEntry
  ],
  exports: [
    EntrySense,
    LanguageChooser,
    SenseExample,
    WordlistEntry
  ],
  imports: [
    PipesModule,
    IonicModule
  ]
})
export class ComponentsModule {
}
