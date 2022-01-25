import { Injectable } from '@angular/core'
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
  AutoUpdateEvent,
} from '../../../../../app/shared/actions'
import { allowedConfigKeys } from '../../../../../app/shared/constants'
import { Doc, Encoding } from '../../../../../app/shared/interfaces'
import { pick } from 'lodash'

type OmitActionType<T> = Omit<T, 'type'>
@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  constructor() {}

  public on(channel: string, listener: any): void {
    if (!window.ipc) {
      return
    }

    window.ipc.on(channel, listener)
  }

  public send<T>(channel: ActionType, payload?: T): void {
    if (!window.ipc) {
      return
    }
    window.ipc.send(channel, payload ? this.addActionType(channel, payload) : null)
  }

  public async handle<T>(channel: HandlerAction, payload?: T): Promise<any> {
    if (!window.ipc) {
      return
    }
    return window.ipc.invoke(channel, payload)
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

  initFileWatcher(payload: { filePath: string }): void {
    this.send(StoreActions.InitFileWatcher, payload)
  }

  showContextMenu(): void {
    this.send(ContextMenuActions.ShowEditorContextMenu)
  }

  startAutoUpdater(): void {
    this.send(AutoUpdateEvent.StartAutoUpdater)
  }

  downloadUpdate(): void {
    this.send(AutoUpdateEvent.DownloadUpdate)
  }

  quitAndInstall(): void {
    this.send(AutoUpdateEvent.QuitAndInstall)
  }

  async getFileData(payload: { filePath: string; encoding: Encoding }): Promise<string> {
    return this.handle(HandlerAction.GetFileData, payload)
  }

  async getDirectoryPath(payload: { filePath: string }): Promise<string> {
    return this.handle(HandlerAction.ChooseDirectory, payload)
  }

  async getThumbnail(payload: { filePath: string; baseDir: string }): Promise<string> {
    return this.handle(HandlerAction.GetThumbnail, payload)
  }

  async getRecentlyModified(): Promise<Doc[]> {
    return this.handle(HandlerAction.GetRecentlyModified)
  }

  async getBookmarkedFiles(payload: { bookmarks: string[] }): Promise<Doc[]> {
    return this.handle(HandlerAction.GetBookmarkedFiles, payload)
  }

  private addActionType<T extends OmitActionType<UpdateActionPayload>>(
    channel: ActionType,
    payload: T
  ): T & { type: ActionType } {
    return { ...payload, type: channel }
  }
}
