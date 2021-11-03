import { Injectable } from '@angular/core'
import { CanActivate } from '@angular/router'
import { Router } from '@angular/router'
import { MenuItem } from 'primeng/api'
import appConfig from '../../../app/acolite.config.json'

interface AppConfig {
  baseDir?: string
  menuItems?: MenuItem[]
}

@Injectable()
export class BaseDirGuard implements CanActivate {
  canActivate() {
    const config: AppConfig = appConfig
    console.log(config)

    if (config?.baseDir) {
      this.router.navigate(['main'])
    }
    return true
  }
  constructor(private router: Router) {}
}
