import { Injectable } from '@angular/core'

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron'
import * as remote from '@electron/remote'
import * as childProcess from 'child_process'
import * as fs from 'fs'
import {
  ActionType,
  CreateFile,
  CreateNewDirectory,
  DeleteFiles,
  FileActions,
  FolderActions,
  GetBookmarkedFiles,
  MoveFiles,
  OpenFileLocation,
  ReadDirectory,
  ReadFile,
  RenameFile,
  SearchActions,
  SearchQuery,
  StoreActions,
  UpdateActionPayload,
  UpdateFileContent,
} from '../../../../../app/actions'
import { AppConfig } from '../../../interfaces/Menu'
import { pick } from 'lodash'
import { allowedConfigKeys } from '../../../entities/file/constants'

type OmitActionType<T> = Omit<T, 'type'>
@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer
  webFrame: typeof webFrame
  remote: typeof remote
  childProcess: typeof childProcess
  fs: typeof fs

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type)
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer
      this.webFrame = window.require('electron').webFrame
      this.childProcess = window.require('child_process')
      this.fs = window.require('fs')
      this.remote = window.require('@electron/remote')
    }
  }

  public on(channel: string, listener: any): void {
    if (!this.ipcRenderer) {
      return
    }

    this.ipcRenderer.on(channel, listener)
  }

  public send<T>(channel: ActionType, payload?: T): void {
    if (!this.ipcRenderer) {
      return
    }
    const action = this.addActionType(channel, payload)
    this.ipcRenderer.send(channel, action)
  }

  public once(channel: string, listener: any): void {
    if (!this.ipcRenderer) {
      return
    }
    this.ipcRenderer.once(channel, listener)
  }

  // Folder actions

  readDirectoryRequest(payload: OmitActionType<ReadDirectory>): void {
    this.send(FolderActions.ReadDir, payload)
  }

  createNewFolderRequest(payload: OmitActionType<CreateNewDirectory>): void {
    this.send(FolderActions.MkDir, payload)
  }

  setDefaultDir(): void {
    this.send(FolderActions.SetDefaultDir, {})
  }

  chooseDirectory(): void {
    this.send(FolderActions.ChooseDir, {})
  }

  // File actions

  createNewFileRequest(payload: OmitActionType<CreateFile>): void {
    this.send(FileActions.Create, payload)
  }

  renameFileRequest(payload: OmitActionType<RenameFile>): void {
    this.send(FileActions.Rename, payload)
  }

  deleteFilesRequest(payload: OmitActionType<DeleteFiles>): void {
    this.send(FileActions.DeleteFiles, payload)
  }

  moveFilesRequest(payload: OmitActionType<MoveFiles>): void {
    this.send(FileActions.MoveFiles, payload)
  }

  readFileRequest(payload: OmitActionType<ReadFile>): void {
    this.send(FileActions.ReadFile, payload)
  }

  openFileLocationRequest(payload: OmitActionType<OpenFileLocation>): void {
    this.send(FileActions.OpenFileLocation, payload)
  }

  updateFileContent(payload: OmitActionType<UpdateFileContent>): void {
    this.send(FileActions.Update, payload)
  }

  // Store actions

  searchFiles(payload: OmitActionType<SearchQuery>): void {
    this.send(SearchActions.Query, payload)
  }

  updateStore(payload: OmitActionType<AppConfig>): void {
    const filtered = pick(payload, allowedConfigKeys)
    this.send(StoreActions.UpdateStore, filtered)
  }

  initApp(): void {
    this.send(StoreActions.InitApp, {})
  }

  getRecentlyModified(): void {
    this.send(StoreActions.GetRecentlyModified, {})
  }

  getBookmarked(payload: OmitActionType<GetBookmarkedFiles>): void {
    this.send(StoreActions.GetBookmarkedFiles, payload)
  }

  addActionType<T extends OmitActionType<UpdateActionPayload>>(
    channel: ActionType,
    payload: T
  ): T & { type: ActionType } {
    return { ...payload, type: channel }
  }
}
