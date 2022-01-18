import { Component, NgZone, OnInit } from '@angular/core'
import { ElectronService } from './core/services'
import { TranslateService } from '@ngx-translate/core'
import { APP_CONFIG } from '../environments/environment'
import { AppDialogService } from './services/dialog.service'
import { ThemeService } from './services/theme.service'
import { StateService, StateUpdate } from './services/state.service'
import { Router } from '@angular/router'
import { FileActionResponses, FolderActionResponses, SearchResponses, StoreResponses } from '../../app/shared/actions'
import { State } from '../../app/shared/interfaces'
import { takeUntil } from 'rxjs/operators'
import { AbstractComponent } from './abstract/abstract-component'

type IPCEvent = Electron.IpcMessageEvent
type IPCResponse = FolderActionResponses | FileActionResponses | StoreResponses | SearchResponses
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends AbstractComponent implements OnInit {
  initialized = false

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private themeService: ThemeService,
    public state: StateService,
    public router: Router,
    public dialogService: AppDialogService,
    public zone: NgZone
  ) {
    super()
    this.electronService.initApp()
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
    this.state
      .getStatePart('appTheme')
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.themeService.setTheme(theme)
      })
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
      FileActionResponses.UpdateSuccess,
      FileActionResponses.UpdateFailure,
      FileActionResponses.CopySuccess,
      FileActionResponses.CopyFailure,
      StoreResponses.Indexing,
      StoreResponses.IndexingReady,
      StoreResponses.ReadStoreSuccess,
      StoreResponses.ReadStoreFailure,
      StoreResponses.InitAppSuccess,
      StoreResponses.InitAppFailure,
      StoreResponses.UpdateStoreFailure,
      SearchResponses.QuerySuccess,
    ]

    actions.forEach((action) => this.startListener(action))
  }

  startListener(action: IPCResponse): void {
    this.electronService.on(action, (_ipcEvent: IPCEvent, arg: any) => {
      this.ipcEventReducer(action, arg)
    })
  }

  ipcEventReducer(action: IPCResponse, response: any): void {
    this.zone.run(() => {
      switch (action) {
        // Store actions

        case StoreResponses.InitAppSuccess: {
          this.initialiseApp(response)
          break
        }
        case StoreResponses.InitAppFailure: {
          console.error(response)
          break
        }
        // Folder actions

        case FolderActionResponses.ReadDirectorySuccess:
        case FileActionResponses.CopySuccess:
        case FileActionResponses.CreateSuccess:
        case FolderActionResponses.MakeDirectorySuccess: {
          this.state.updateState$.next([{ key: 'rootDirectory', payload: response.rootDirectory }])
          break
        }
        case FolderActionResponses.ChooseDirectorySuccess: {
          const currentState = this.state.state$.getValue()
          console.log(response)
          this.state.state$.next({ ...currentState, ...response })
          this.readDir()
          break
        }
        case FolderActionResponses.SetDefaultDirSuccess: {
          this.state.updateState$.next([{ key: 'baseDir', payload: response.baseDir }])
          this.readDir()
          break
        }

        // File actions

        case FileActionResponses.MoveSuccess: {
          const { rootDirectory, tabs } = response
          const payload: StateUpdate<State>[] = [
            { key: 'rootDirectory', payload: rootDirectory },
            { key: 'tabs', payload: tabs },
          ]
          this.state.updateState$.next(payload)
          break
        }
        case FileActionResponses.CreateFailure: {
          this.dialogService.openToast('File creation failed', 'failure')
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
          const { rootDirectory, tabs } = response
          const payload: StateUpdate<State>[] = [
            { key: 'rootDirectory', payload: rootDirectory },
            { key: 'tabs', payload: tabs },
          ]
          this.state.updateState$.next(payload)
          break
        }
        case FileActionResponses.DeleteFailure: {
          this.dialogService.openToast('Something went wrong while deleting', 'failure')
          break
        }
        case FileActionResponses.DeleteSuccess: {
          const { rootDirectory, tabs } = response
          const payload: StateUpdate<State>[] = [
            { key: 'rootDirectory', payload: rootDirectory },
            { key: 'tabs', payload: tabs },
          ]
          this.state.updateState$.next(payload)
          this.dialogService.openToast('Delete success', 'success')
          break
        }
        case FileActionResponses.UpdateFailure: {
          this.dialogService.openToast('Something went wrong while updating', 'failure')
          break
        }
        case FileActionResponses.UpdateSuccess: {
          const { tabs } = response
          const payload: StateUpdate<State>[] = [{ key: 'tabs', payload: tabs }]
          this.state.updateState$.next(payload)
          break
        }

        case FileActionResponses.ReadSuccess: {
          const { tabs, selectedTab } = response
          const payload: StateUpdate<State>[] = [
            { key: 'tabs', payload: tabs },
            { key: 'selectedTab', payload: selectedTab },
          ]

          this.state.updateState$.next(payload)
          break
        }
        case StoreResponses.UpdateStoreFailure: {
          this.dialogService.openToast('Updating configuration file failed', 'failure')
          break
        }
        case SearchResponses.QuerySuccess: {
          this.state.updateState$.next([{ key: 'searchResults', payload: response.searchResults }])
          break
        }
        case StoreResponses.IndexingReady: {
          this.state.updateState$.next([{ key: 'indexingReady', payload: true }])
          break
        }
        case StoreResponses.Indexing: {
          console.log(response)
          this.state.updateState$.next([{ key: 'indexing', payload: response.indexing }])
          break
        }
        default: {
          console.log({ message: 'default reducer', action, response })
          break
        }
      }
    })
  }

  initialiseApp(response: Partial<State>): void {
    const initialState = this.state.initialState

    const mapIsoString = () => {
      if (response.searchPreferences?.length) {
        const convertIsoStringToDate = (range: { start?: string; end?: string }) => {
          const { start, end } = range
          const payload = {
            start: undefined,
            end: undefined,
          }

          if (start) {
            payload.start = new Date(start)
          }
          if (end) {
            payload.end = new Date(end)
          }
          return payload
        }

        response.searchPreferences = response.searchPreferences.map((pref) => {
          if (pref.range) {
            pref.range = convertIsoStringToDate(pref.range as any)
          }
          return pref
        })
      }
    }
    mapIsoString()

    this.state.state$.next({ ...initialState, ...response, initialized: true })

    const baseDir = this.state.getStatePartValue('baseDir')
    if (!baseDir) {
      this.router.navigate(['base-dir'])
    } else {
      this.electronService.initFileWatcher({ filePath: baseDir })
    }
  }

  readDir(): void {
    const baseDir = this.state.getStatePartValue('baseDir')
    if (baseDir) {
      this.electronService.readDirectoryRequest({ state: this.state.value })
      this.electronService.initFileWatcher({ filePath: baseDir })
    }
  }
}
