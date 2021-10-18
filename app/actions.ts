import { TreeNode } from 'primeng/api'
import { FileEntity } from '../src/app/interfaces/Menu'

export interface CreateFile {
  type: FileActions.Create
  path: string
  menuItems: TreeNode<FileEntity>[]
}
export interface ReadDirectory {
  type: FolderActions.ReadDir
  baseDir: string
}

export interface CreateNewDirectory {
  type: FolderActions.MkDir
  directoryName: string
  baseDir: string
  menuItems: TreeNode<FileEntity>[]
}

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
}

export enum FileActionResponses {
  CreateSuccess = 'create-file-success',
  CreateFailure = 'create-file-failure',
}
