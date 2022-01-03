import { SearchPreference, State, TreeElement } from './interfaces'

export type UpdateActionPayload =
  | ReadDirectory
  | CreateNewDirectory
  | ChooseDir
  | SetDefaultDir
  | CreateFile
  | CreateImageFile
  | RenameFile
  | DeleteFiles
  | CopyFiles
  | MoveFiles
  | ReadFile
  | UpdateFileContent
  | GetStore
  | UpdateStore
  | InitApp
  | SearchQuery
  | OpenFileLocation
  | GetRecentlyModified
  | GetBookmarkedFiles

export type ActionType = FileActions | FolderActions | StoreActions | SearchActions

export interface CreateFile {
  type: FileActions.Create
  filePath: string
  openFileAfterCreation: boolean
  content?: string
  state: State
}

export interface CreateImageFile {
  type: FileActions.CreateImage
  filePath: string
  content: string
  state: State
  encoding?: 'binary' | 'base64'
  isPDF?: boolean
}
export interface ReadDirectory {
  type: FolderActions.ReadDir
  state: State
}

export interface CreateNewDirectory {
  type: FolderActions.MkDir
  directoryName: string
  parentPath?: string
  state: State
}

export interface RenameFile {
  type: FileActions.Rename
  filePath: string
  newName: string
  state: State
}

export interface DeleteFiles {
  type: FileActions.DeleteFiles
  directoryPaths: string[]
  filePaths: string[]
  state: State
}

export interface MoveFiles {
  type: FileActions.MoveFiles
  target: TreeElement
  elementsToMove: TreeElement[]
  state: State
}

export interface CopyFiles {
  type: FileActions.CopyFiles
  target: TreeElement
  filePathsToCopy: string[]
  state: State
}

export interface ReadFile {
  type: FileActions.ReadFile
  filePath: string
  state: State
}

export interface ReadImageData {
  type: FileActions.ReadFile
  filePath: string
  state: State
}

export interface ChooseDirectory {
  type: HandlerAction.ChooseDirectory
  filePath: string
}

export interface OpenFileLocation {
  type: FileActions.OpenFileLocation
  filePath: string
}
export interface UpdateFileContent {
  type: FileActions.Update
  content: string
  filePath: string
  state: State
}
export interface SetDefaultDir {
  type: FolderActions.SetDefaultDir
}

export interface GetRecentlyModified {
  type: StoreActions.GetRecentlyModified
}

export interface GetBookmarkedFiles {
  type: StoreActions.GetBookmarkedFiles
  bookmarks: string[]
}
export interface ChooseDir {
  type: FolderActions.ChooseDir
}

export interface GetStore {
  type: StoreActions.GetStore
}

export interface InitApp {
  type: StoreActions.InitApp
}

export interface UpdateStore {
  type: StoreActions.UpdateStore
  state: State
}

export interface SearchQuery {
  type: SearchActions.Query
  searchOpts?: SearchOptions
}

export interface Handler {
  type: HandlerAction
}

interface SearchOptions {
  textContent?: string
  baseDir?: string
  searchPreferences: SearchPreference[]
}

export enum FolderActions {
  ChooseDir = 'choose-directory',
  SetDefaultDir = 'set-default-directory',
  MkDir = 'make-directory',
  ReadDir = 'read-directory',
}

export enum FolderActionResponses {
  ReadDirectorySuccess = 'read-directory-success',
  ReadDirectoryFailure = 'read-directory-failure',
  MakeDirectorySuccess = 'make-directory-success',
  MakeDirectoryFailure = 'make-directory-failure',
  SetDefaultDirSuccess = 'set-default-directory-success',
  SetDefaultDirFailure = 'set-default-directory-failure',
  ChooseDirectorySuccess = 'choose-directory-success',
  ChooseDirectoryCanceled = 'choose-directory-canceled',
  ChooseDirectoryFailure = 'choose-directory-failure', // Probably can't happen but just in case ¯\_(ツ)_/¯
}

export enum FileActions {
  Create = 'create-file',
  CreateImage = 'create-image-file',
  Rename = 'rename-file',
  Update = 'update-file',
  CopyFiles = 'copy-files',
  DeleteFiles = 'delete-files',
  MoveFiles = 'move-files',
  ReadFile = 'read-file',
  ReadImageData = 'read-image-data',
  OpenFileLocation = 'open-file-location',
}

export enum StoreActions {
  InitApp = 'init-app',
  GetStore = 'read-store',
  UpdateStore = 'update-store',
  GetRecentlyModified = 'get-recently-modified',
  GetBookmarkedFiles = 'get-bookmarked-files',
}

export enum ContextMenuActions {
  ShowEditorContextMenu = 'show-editor-context-menu',
}

export enum SearchActions {
  Query = 'query-index',
}

export enum HandlerAction {
  GetTabData = 'get-tab-data',
  GetImageBase64 = 'get-image-base64',
  ChooseDirectory = 'choose-directory',
}

export enum FileActionResponses {
  CreateSuccess = 'create-file-success',
  CreateFailure = 'create-file-failure',
  RenameSuccess = 'rename-file-success',
  RenameFailure = 'rename-file-failure',
  DeleteSuccess = 'delete-files-success',
  DeletePartialSuccess = 'delete-partial-success',
  DeleteFailure = 'delete-files-failure',
  MoveSuccess = 'move-files-success',
  MoveFailure = 'move-files-failure',
  CopySuccess = 'copy-files-success',
  CopyFailure = 'copy-files-failure',
  ReadSuccess = 'read-file-success',
  ReadFailure = 'read-file-failure',
  UpdateSuccess = 'update-success',
  UpdateFailure = 'update-failure',
}

export enum StoreResponses {
  ReadStoreSuccess = 'read-store-success',
  ReadStoreFailure = 'read-store-failure',
  CreateStoreSuccess = 'create-store-success',
  CreateStoreFailure = 'create-store-failure',
  UpdateStoreSuccess = 'update-store-success',
  UpdateStoreFailure = 'update-store-failure',
  InitAppSuccess = 'init-app-success',
  InitAppFailure = 'init-app-failure',
  GetDashboardConfigSuccess = 'get-dashboard-config-success',
  GetDashboardConfigFailure = 'get-dashboard-config-failure',
  GetRecentlyModifiedSuccess = 'get-recently-modified-success',
  GetRecentlyModifiedFailure = 'get-recently-modified-failure',
  GetBookmarkedFilesSuccess = 'get-bookmarked-files-success',
  GetBookmarkedFilesFailure = 'get-bookmarked-files-failure',
}

export enum SearchResponses {
  QuerySuccess = 'query-success',
  QueryFailure = 'query-failure',
}
