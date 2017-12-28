import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Transfer } from '@ionic-native/transfer';

import { MyApp } from './app.component';
import { ComponentsModule } from '../components/components.module'
import { PipesModule } from '../pipes/pipes.module'

// providers
import { AttachmentService } from '../providers/attachment-service'
import { ConnectivityService } from '../providers/connectivity-service'
import { DatabaseService } from '../providers/database-service'
import { EntryService } from '../providers/entry-service'
import { LanguageService } from '../providers/language-service'
import { SyncService } from '../providers/sync-service'

// 3rd party deps
import firebase from 'firebase'


// firebase
export const firebaseConfig = {
  apiKey: "XXXXXXXX",
  authDomain: "XXXXXXXX",
  databaseURL: "XXXXXXXX",
  projectId: "XXXXXXXX",
  storageBucket: "XXXXXXXX",
  messagingSenderId: "XXXXXXXX"
}

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    ComponentsModule,
    PipesModule,
    IonicModule.forRoot(MyApp, {
      preloadModules: true
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    AttachmentService,
    ConnectivityService,
    DatabaseService,
    EntryService,
    LanguageService,
    SyncService,
    File,
    SplashScreen,
    StatusBar,
    Transfer,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {
  constructor() {
    firebase.initializeApp(firebaseConfig)
  }
}
