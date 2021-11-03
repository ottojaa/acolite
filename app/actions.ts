import { TreeNode } from 'primeng/api'
import { FileEntity, TreeElement } from '../src/app/interfaces/Menu'

export interface CreateFile {
  path: string
  rootDirectory: TreeElement
}
export interface ReadDirectory {
  baseDir: string
}

export interface CreateNewDirectory {
  directoryName: string
  baseDir: string
  rootDirectory: TreeElement
  parentPath?: string
}

export interface RenameFile {
  oldPath: string
  newPath: string
  isFolder: boolean
  rootDirectory: TreeElement
}

export interface DeleteFiles {
  baseDir: string
  rootDirectory: TreeElement
  directoryPaths: string[]
  filePaths: string[]
}

export interface MoveFiles {
  target: TreeElement
  rootDirectory: TreeElement
  elementsToMove: TreeElement[]
  baseDir: string
}

export interface SetDefaultDir {}

export interface ElectronAction<T = any> {
  data: T
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
  Delete = 'delete',
  Paste = 'paste-file',
  Copy = 'copy-file',
  Cut = 'cut-file',
  OpenInFolder = 'open-file-in-folder',
  ModifyTags = 'modify-tags',
  DeleteFiles = 'delete-files',
  MoveFiles = 'move-files',
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
}
