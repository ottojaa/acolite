import { Injectable } from '@angular/core'
import { CanActivate } from '@angular/router'
import { Router } from '@angular/router'
import appConfig from '../../../app/acolite.config.json'

@Injectable()
export class BaseDirGuard implements CanActivate {
  canActivate() {
    console.log(appConfig)
    if (appConfig.baseDir) {
      this.router.navigate(['main'])
    }
    return true
  }
  constructor(private router: Router) {}
}
