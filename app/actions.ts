import { Tab, TreeElement } from '../src/app/interfaces/Menu'

export type UpdateActionPayload =
  | ReadDirectory
  | CreateNewDirectory
  | ChooseDir
  | SetDefaultDir
  | CreateFile
  | RenameFile
  | DeleteFiles
  | MoveFiles
  | ReadFile
  | UpdateFileContent
  | GetStore
  | UpdateStore
  | InitApp
  | SearchQuery

export type ActionType = FileActions | FolderActions | StoreActions | SearchActions

export interface CreateFile {
  type: FileActions.Create
  path: string
  rootDirectory: TreeElement
}
export interface ReadDirectory {
  type: FolderActions.ReadDir
  baseDir: string
}

export interface CreateNewDirectory {
  type: FolderActions.MkDir
  directoryName: string
  baseDir: string
  rootDirectory: TreeElement
  parentPath?: string
}

export interface RenameFile {
  type: FileActions.Rename
  path: string
  newName: string
  rootDirectory: TreeElement
}

export interface DeleteFiles {
  type: FileActions.DeleteFiles
  baseDir: string
  rootDirectory: TreeElement
  directoryPaths: string[]
  filePaths: string[]
}

export interface MoveFiles {
  type: FileActions.MoveFiles
  target: TreeElement
  rootDirectory: TreeElement
  elementsToMove: TreeElement[]
  tabs: Tab[]
  baseDir: string
}

export interface ReadFile {
  type: FileActions.ReadFile
  filePath: string
}
export interface UpdateFileContent {
  type: FileActions.Update
  content: string
  path: string
  tabs: Tab[]
}
export interface SetDefaultDir {
  type: FolderActions.SetDefaultDir
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
  baseDir?: string
  tabs?: Tab[]
  fontSize?: string
  sideMenuWidth?: number
}

export interface SearchQuery {
  type: SearchActions.Query
  searchOpts?: SearchOptions
}

interface SearchOptions {
  content?: string
  modifiedAt?: string
  baseDir?: string
  createdAt?: string
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
  Rename = 'rename-file',
  Update = 'update-file',
  DeleteFiles = 'delete-files',
  MoveFiles = 'move-files',
  ReadFile = 'read-file',
}

export enum StoreActions {
  InitApp = 'init-app',
  GetStore = 'read-store',
  UpdateStore = 'update-store',
}

export enum SearchActions {
  Query = 'query-index',
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
}

export enum SearchResponses {
  QuerySuccess = 'query-success',
  QueryFailure = 'query-failure',
}
