import { Component, OnInit } from '@angular/core'
import { ElectronService } from './core/services'
import { TranslateService } from '@ngx-translate/core'
import { APP_CONFIG } from '../environments/environment'
import { ThemeService } from './services/theme.service'
import themes from '../assets/themes/theme-options.json'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private themeService: ThemeService
  ) {
    this.translate.setDefaultLang('en')
    console.log('APP_CONFIG', APP_CONFIG)

    if (electronService.isElectron) {
      console.log(process.env)
      console.log('Run in electron')
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer)
      console.log('NodeJS childProcess', this.electronService.childProcess)
    } else {
      console.log('Run in browser')
    }
    this.electronService.on('pong', (event: Electron.IpcMessageEvent) => {
      console.log('pong')
    })

    this.electronService.send('ping')
  }

  ngOnInit(): void {
    /* window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      console.log(e.target)
      this.electronService.send('show-context-menu')
    }) */
  }
}
