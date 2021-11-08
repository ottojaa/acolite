import { Injectable } from '@angular/core'

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron'
import * as remote from '@electron/remote'
import * as childProcess from 'child_process'
import * as fs from 'fs'
import {
  CreateFile,
  CreateNewDirectory,
  DeleteFiles,
  ElectronAction,
  FolderActions,
  MoveFiles,
  ReadDirectory,
  ReadFile,
  RenameFile,
  UpdateFileContent,
} from '../../../../../app/actions'

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

  public send(channel: string, ...args): void {
    if (!this.ipcRenderer) {
      return
    }
    this.ipcRenderer.send(channel, ...args)
  }

  public once(channel: string, listener: any): void {
    if (!this.ipcRenderer) {
      return
    }
    this.ipcRenderer.once(channel, listener)
  }

  // Folder actions

  readDirectoryRequest(payload: ElectronAction<ReadDirectory>): void {
    this.send(FolderActions.ReadDir, payload)
  }

  createNewFolderRequest(payload: ElectronAction<CreateNewDirectory>): void {
    this.send(FolderActions.MkDir, payload)
  }

  setDefaultDir(): void {
    this.send(FolderActions.SetDefaultDir)
  }

  chooseDirectory(): void {
    this.send(FolderActions.ChooseDir)
  }

  // File actions

  createNewFileRequest(channel: string, payload: ElectronAction<CreateFile>): void {
    this.send(channel, payload)
  }

  renameFileRequest(channel: string, payload: ElectronAction<RenameFile>): void {
    this.send(channel, payload)
  }

  deleteFilesRequest(channel: string, payload: ElectronAction<DeleteFiles>): void {
    this.send(channel, payload)
  }

  moveFilesRequest(channel: string, payload: ElectronAction<MoveFiles>): void {
    this.send(channel, payload)
  }

  readFileRequest(channel: string, payload: ElectronAction<ReadFile>): void {
    this.send(channel, payload)
  }

  updateFileContent(channel: string, payload: ElectronAction<UpdateFileContent>): void {
    this.send(channel, payload)
  }
}
