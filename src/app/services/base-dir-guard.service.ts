import { Injectable } from '@angular/core'
import { CanActivate } from '@angular/router'
import { Router } from '@angular/router'
import appConfig from '../../../app/acolite.config.json'
import { AppPreferences } from '../interfaces/Preferences'

@Injectable()
export class BaseDirGuard implements CanActivate {
  appPreferences: AppPreferences
  canActivate() {
    if (this.appPreferences.baseDir) {
      this.router.navigate(['main'])
    }
    return true
  }
  constructor(private router: Router) {
    console.log(this.appPreferences)
    this.appPreferences = appConfig
  }
}
