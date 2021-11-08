import { Component, NgZone, OnInit } from '@angular/core'
import { ElectronService } from './core/services'
import { TranslateService } from '@ngx-translate/core'
import { APP_CONFIG } from '../environments/environment'
import appConfig from '../../app/acolite.config.json'
import { AppDialogService } from './services/dialog.service'
import { ThemeService } from './services/theme.service'
import { State, StateService, StateUpdate } from './services/state.service'
import { MenuService } from './services/menu.service'
import { FileActionResponses, FolderActionResponses, FolderActions } from '../../app/actions'
import { Tab } from './interfaces/Menu'
import { Router } from '@angular/router'

interface AppConfig {
  baseDir?: string
  tabs?: Tab[]
}
type IPCEvent = Electron.IpcMessageEvent

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  _appConfig: AppConfig

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private themeService: ThemeService,
    public menuService: MenuService,
    public state: StateService,
    public router: Router,
    public dialogService: AppDialogService,
    public zone: NgZone
  ) {
    this._appConfig = appConfig
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
    this.initAppPreferences()
  }

  initAppPreferences(): void {
    const { baseDir, tabs } = this._appConfig

    let updateArr: StateUpdate<State>[] = []
    if (baseDir) {
      updateArr.push({ key: 'baseDir', payload: baseDir })
    } else {
      this.router.navigate(['base-dir'])
    }
    if (tabs && tabs.length) {
      updateArr.push({ key: 'tabs', payload: tabs })
    }
    if (updateArr.length) {
      this.state.updateMulti$.next(updateArr)
    }
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
      FileActionResponses.CreateSuccess,
      FileActionResponses.CreateFailure,
      FileActionResponses.RenameSuccess,
      FileActionResponses.RenameFailure,
      FileActionResponses.MoveFailure,
      FileActionResponses.MoveSuccess,
      FileActionResponses.DeleteSuccess,
      FileActionResponses.DeleteFailure,
      FileActionResponses.ReadSuccess,
      FileActionResponses.ReadFailure,
    ]

    actions.forEach((action) => this.startListener(action))
  }

  startListener(action: FolderActionResponses | FileActionResponses): void {
    this.electronService.on(action, (_ipcEvent: IPCEvent, arg: any) => {
      this.ipcEventReducer(action, arg)
    })
  }

  ipcEventReducer(action: FolderActionResponses | FileActionResponses, response: any): void {
    this.zone.run(() => {
      switch (action) {
        case FolderActionResponses.ReadDirectorySuccess: {
          console.log(response)
          this.state.updateState$.next({ key: 'rootDirectory', payload: response })
          break
        }
        case FolderActionResponses.MakeDirectorySuccess: {
          this.state.updateState$.next({ key: 'rootDirectory', payload: response })
          break
        }
        case FileActionResponses.CreateFailure: {
          this.dialogService.openToast('File creation failed', 'failure')
          break
        }
        case FileActionResponses.MoveSuccess: {
          this.state.updateState$.next({ key: 'rootDirectory', payload: response })
          break
        }
        case FileActionResponses.MoveFailure: {
          this.dialogService.openToast('Something went wrong while moving', 'failure')
          break
        }
        case FileActionResponses.RenameFailure: {
          this.dialogService.openToast('Something went wrong while renaming', 'failure')
          break
        }
        case FileActionResponses.RenameSuccess: {
          this.state.updateState$.next({ key: 'rootDirectory', payload: response })
          break
        }
        case FileActionResponses.CreateSuccess: {
          this.state.updateState$.next({ key: 'rootDirectory', payload: response })
          break
        }
        case FileActionResponses.DeleteFailure: {
          this.dialogService.openToast('Something went wrong while deleting', 'failure')
          break
        }
        case FileActionResponses.DeleteSuccess: {
          this.state.updateState$.next({ key: 'rootDirectory', payload: response })
          break
        }
        case FolderActionResponses.ChooseDirectorySuccess: {
          this.state.updateState$.next({ key: 'baseDir', payload: response })
          this.readDir()
          break
        }
        case FolderActionResponses.SetDefaultDirSuccess: {
          this.state.updateState$.next({ key: 'baseDir', payload: response })
          this.readDir()
          break
        }
        case FileActionResponses.ReadSuccess: {
          const tabs = this.state.getStatePartValue('tabs')
          const tabIdx = tabs.findIndex((tab) => tab.path === response.path)
          if (tabIdx === -1) {
            tabs.push(response)
          }

          const selectedTab = tabIdx === -1 ? tabs.length - 1 : tabIdx
          const payload: StateUpdate<State>[] = [
            { key: 'tabs', payload: tabs },
            { key: 'selectedTab', payload: selectedTab },
          ]

          this.state.updateMulti$.next(payload)
          break
        }
        default: {
          console.log({ message: 'default reducer', action, response })
          break
        }
      }
    })
  }

  readDir(): void {
    const baseDir = this.state.getStatePartValue('baseDir')
    if (baseDir) {
      this.electronService.readDirectoryRequest({ data: { baseDir } })
    }
  }
}
