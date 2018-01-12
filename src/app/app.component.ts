import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DatabaseService } from '../providers/database-service'
import { SyncService } from '../providers/sync-service'


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = 'Home';

  constructor(
    platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen,
    public databaseService: DatabaseService,
    public syncService: SyncService
    ) {

    this.databaseService.initDB()
    this.sync()

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  async sync() {
    try {
      await this.syncService.sync()
    } catch (err) {
      console.log("sync err",err)
    }
  }
}

