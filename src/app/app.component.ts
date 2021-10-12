import { Component, OnInit } from '@angular/core'
import { ElectronService } from './core/services'
import { TranslateService } from '@ngx-translate/core'
import { APP_CONFIG } from '../environments/environment'
import appConfig from '../../app/acolite.config.json'
import { AppDialogService } from './services/dialog.service'
import { ThemeService } from './services/theme.service'
import { AppPreferences } from './interfaces/Preferences'
import { FolderActionResponses, FolderActions } from './entities/folder/constants'
import { StateService } from './services/state.service'

type IPCEvent = Electron.IpcMessageEvent

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private themeService: ThemeService,
    public state: StateService,
    public dialogService: AppDialogService
  ) {
    console.log(appConfig.baseDir)
    this.state.updateState$.next({ key: 'baseDir', payload: appConfig.baseDir })
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
    this.initIPCMainListeners()
  }

  ngOnInit(): void {
    this.themeService.setTheme('Light grey')
    if (this.state.getStatePartValue('baseDir')) {
      this.readDir()
    }
  }

  initIPCMainListeners(): void {
    const actions = [
      FolderActionResponses.ReadDirectorySuccess,
      FolderActionResponses.ReadDirectoryFailure,
      FolderActionResponses.MakeDirectorySuccess,
      FolderActionResponses.MakeDirectoryFailure,
      FolderActionResponses.ChooseDirectorySuccess,
      FolderActionResponses.ChooseDirectoryCanceled,
      FolderActionResponses.ChooseDirectoryFailure,
      FolderActionResponses.SetDefaultDirFailure,
      FolderActionResponses.SetDefaultDirSuccess,
    ]

    actions.forEach((action) => this.startListener(action))
  }

  startListener(action: FolderActions | FolderActionResponses): void {
    this.electronService.on(action, (ipcEvent: IPCEvent, arg) => {
      if (action === FolderActionResponses.MakeDirectorySuccess) {
        this.dialogService.openToast('Folder created succesfully', 'success')
      }
      if (action === FolderActionResponses.MakeDirectoryFailure) {
        this.dialogService.openToast('Folder creation failed', 'failure')
      }
      if (action === FolderActionResponses.ReadDirectorySuccess) {
        console.log(ipcEvent)
        console.log(arg)
      }
    })
  }

  readDir(): void {
    const baseDir = this.state.getStatePartValue('baseDir')
    if (baseDir) {
      this.electronService.send(FolderActions.ReadDir, baseDir)
    }
  }
}
