import { Component, OnInit } from '@angular/core'
import { ElectronService } from './core/services'
import { TranslateService } from '@ngx-translate/core'
import { APP_CONFIG } from '../environments/environment'
import appConfig from '../../app/acolite.config.json'
import { AppDialogService } from './services/dialog.service'
import { ThemeService } from './services/theme.service'
import { StateService } from './services/state.service'
import { MenuService } from './services/menu.service'
import { FileActionResponses, FolderActionResponses, FolderActions } from '../../app/actions'

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
    public menuService: MenuService,
    public state: StateService,
    public dialogService: AppDialogService
  ) {
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
      FileActionResponses.CreateFailure,
      FileActionResponses.MoveFailure,
      FileActionResponses.MoveSuccess,
    ]

    actions.forEach((action) => this.startListener(action))
  }

  startListener(action: FolderActionResponses | FileActionResponses): void {
    this.electronService.on(action, (_ipcEvent: IPCEvent, arg: any) => {
      this.ipcEventReducer(action, arg)
    })
  }

  ipcEventReducer(action: FolderActionResponses | FileActionResponses, response: any): void {
    switch (action) {
      case FolderActionResponses.ReadDirectorySuccess: {
        this.state.updateState$.next({ key: 'menuItems', payload: response })
        break
      }
      case FolderActionResponses.MakeDirectorySuccess: {
        this.state.updateState$.next({ key: 'menuItems', payload: response })
        break
      }
      case FileActionResponses.CreateFailure: {
        this.dialogService.openToast('File creation failed', 'failure')
        break
      }
      case FileActionResponses.MoveSuccess: {
        this.state.updateState$.next({ key: 'menuItems', payload: response })
        break
      }
      case FileActionResponses.MoveFailure: {
        this.dialogService.openToast('Something went wrong while moving', 'failure')
      }
      default: {
        console.log({ message: 'default reducer', action, response })
        break
      }
    }
  }

  readDir(): void {
    const baseDir = this.state.getStatePartValue('baseDir')
    if (baseDir) {
      this.electronService.readDirectoryRequest({ data: { baseDir } })
    }
  }
}
