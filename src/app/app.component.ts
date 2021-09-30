import { Component, OnInit } from '@angular/core'
import { ElectronService } from './core/services'
import { TranslateService } from '@ngx-translate/core'
import { APP_CONFIG } from '../environments/environment'
import { HttpClient } from '@angular/common/http'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  themeOptions = []

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private http: HttpClient
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
  }

  ngOnInit(): void {
    this.http
      .get<any>('../assets/themes/theme-options.json')
      .subscribe((data) => {
        this.themeOptions = data
        this.changeTheme('dark')
      })
  }

  changeTheme(theme: string): void {
    const selectedTheme = this.themeOptions.find(
      (option) => option.name === theme
    )
    if (selectedTheme) {
      const { styles } = selectedTheme
      Object.keys(styles).forEach((key) => {
        document.documentElement.style.setProperty(key, styles[key])
      })
    }
  }
}
