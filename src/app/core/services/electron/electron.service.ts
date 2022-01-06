import { Injectable } from '@angular/core'

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron'
import * as remote from '@electron/remote'
import * as childProcess from 'child_process'
import * as fs from 'fs'
import {
  ActionType,
  ReadDirectory,
  CreateNewDirectory,
  CreateFile,
  RenameFile,
  DeleteFiles,
  MoveFiles,
  ReadFile,
  OpenFileLocation,
  UpdateFileContent,
  SearchQuery,
  UpdateActionPayload,
  FileActions,
  FolderActions,
  SearchActions,
  StoreActions,
  UpdateStore,
  HandlerAction,
  ContextMenuActions,
  CopyFiles,
  GetBookmarkedFiles,
  CreateImageFile,
} from '../../../../../app/shared/actions'
import { allowedConfigKeys } from '../../../../../app/shared/constants'
import { Doc } from '../../../../../app/shared/interfaces'
import { pick } from 'lodash'

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

  public async handle<T>(channel: HandlerAction, payload?: T): Promise<any> {
    if (!this.ipcRenderer) {
      return
    }
    return this.ipcRenderer.invoke(channel, payload)
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

  createNewImageRequest(payload: OmitActionType<CreateImageFile>): void {
    this.send(FileActions.CreateImage, payload)
  }

  renameFileRequest(payload: OmitActionType<RenameFile>): void {
    this.send(FileActions.Rename, payload)
  }

  deleteFilesRequest(payload: OmitActionType<DeleteFiles>): void {
    this.send(FileActions.DeleteFiles, payload)
  }

  copyFilesRequest(payload: OmitActionType<CopyFiles>): void {
    this.send(FileActions.CopyFiles, payload)
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

  updateStore(payload: OmitActionType<UpdateStore>): void {
    const filtered = pick(payload.state, allowedConfigKeys)
    this.send(StoreActions.UpdateStore, { state: filtered })
  }

  initApp(): void {
    this.send(StoreActions.InitApp, {})
  }

  getRecentlyModified(): void {
    this.send(StoreActions.GetRecentlyModified, {})
  }

  getBookmarkedFiles(payload: OmitActionType<GetBookmarkedFiles>) {
    this.send(StoreActions.GetBookmarkedFiles, payload)
  }

  showContextMenu(): void {
    this.ipcRenderer.send(ContextMenuActions.ShowEditorContextMenu)
  }

  addActionType<T extends OmitActionType<UpdateActionPayload>>(
    channel: ActionType,
    payload: T
  ): T & { type: ActionType } {
    return { ...payload, type: channel }
  }

  async getFileData(payload: { filePath: string }): Promise<Doc> {
    return this.handle(HandlerAction.GetTabData, payload)
  }

  async getImageData(payload: { filePath: string }): Promise<string> {
    return this.handle(HandlerAction.GetImageBase64, payload)
  }

  async getDirectoryPath(payload: { filePath: string }): Promise<string> {
    return this.handle(HandlerAction.ChooseDirectory, payload)
  }
}
