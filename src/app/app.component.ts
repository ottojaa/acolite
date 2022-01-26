import { Component, NgZone, OnInit } from '@angular/core'
import { ElectronService } from './core/services'
import { TranslateService } from '@ngx-translate/core'
import { APP_CONFIG } from '../environments/environment'
import { AppDialogService } from './services/dialog.service'
import { ThemeService } from './services/theme.service'
import { StateService, StateUpdate } from './services/state.service'
import { Router } from '@angular/router'
import {
  FileActionResponses,
  FolderActionResponses,
  SearchResponses,
  StoreResponses,
} from '../../app/shared/ipc-actions'
import { State } from '../../app/shared/interfaces'
import { filter, skipUntil, switchMap, take, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from './abstract/abstract-component'
import { addTabAndSetAsSelectedTab } from './components/helpers/tab-helpers'
import { Observable } from 'rxjs'
import { MonacoEditorLoaderService } from '@materia-ui/ngx-monaco-editor'

type IPCResponse = FolderActionResponses | FileActionResponses | StoreResponses | SearchResponses
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends AbstractComponent implements OnInit {
  initialized = false

  themeListReady$: Observable<boolean>

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private themeService: ThemeService,
    public state: StateService,
    public router: Router,
    public dialogService: AppDialogService,
    public monacoLoaderService: MonacoEditorLoaderService,
    public zone: NgZone
  ) {
    super()
    this.electronService.initApp()
    this.translate.setDefaultLang('en')

    this.themeListReady$ = this.themeService.isThemeListReady()
    this.initMonacoEditorThemes()
    this.initMonacoEditor()
    this.initMonacoThemeChangeListener()

    console.log('APP_CONFIG', APP_CONFIG)

    this.initIPCMainListeners()
  }

  initMonacoEditor(): void {
    this.monacoLoaderService.isMonacoLoaded$
      .pipe(
        filter((isLoaded) => isLoaded),
        take(1),
        switchMap(() => {
          this.themeService.monacoReady$.next(true)
          return this.themeListReady$.pipe(take(1))
        })
      )
      .subscribe(() => {
        this.themeService.setMonacoTheme(this.state.getStatePartValue('monacoEditorTheme'))
        this.state.updateState$.next([{ key: 'monacoReady', payload: true }])
      })
  }

  initMonacoEditorThemes(): void {
    this.themeService
      .fetchThemeList()
      .pipe(take(1))
      .subscribe((themes) => {
        this.themeService.themeList$.next(themes)
        this.themeService.themeListReady$.next(true)
      })
  }

  initMonacoThemeChangeListener(): void {
    this.state
      .getStatePart('monacoEditorTheme')
      .pipe(skipUntil(this.themeListReady$), takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.themeService.setMonacoTheme(theme)
      })
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
    this.electronService.on(action, (arg: any) => {
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
          const payload = addTabAndSetAsSelectedTab(this.state.state$.value, response.tabData)
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
          this.state.updateState$.next([{ key: 'indexingReady', payload: response.indexingReady }])
          break
        }
        case StoreResponses.Indexing: {
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
      if (response?.searchPreferences?.length) {
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
