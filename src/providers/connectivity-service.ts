import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

declare var navigator

@Injectable()
export class ConnectivityService {
  onlineSubject: Subject<string> = new BehaviorSubject(null)
  status: Observable<string>
  constructor() {
    this.status = this.onlineSubject.asObservable()
    this.reportConnection()
    window.addEventListener("offline", (e) => {
      this.onlineSubject.next('offline')
    })
    window.addEventListener("online", (e) => {
      this.reportConnection()
    })
  }

  isOnline(): boolean {
    // return false
    return navigator.onLine
  }

  isOffline(): boolean {
    return !navigator.onLine
  }

  reportConnection() {
    if (navigator.onLine) {
      if ('connection' in navigator) {
        console.log("online", navigator)
        if (navigator.connection.effectiveType) this.onlineSubject.next("online "+navigator.connection.effectiveType)
        else if (navigator.connection.type) this.onlineSubject.next(navigator.connection.type)
        else this.onlineSubject.next("online")
      } else {
        console.log("now online")
        this.onlineSubject.next("online")
      }
    } else {
      console.log("now offline !!")
      this.onlineSubject.next("offline")
    }
  }

  getStatus(): Subject<string> {
    return this.onlineSubject
  }
}
