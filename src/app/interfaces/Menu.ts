import { TreeNode } from 'primeng/api'

export enum MenuItemTypes {
  File = 'file',
  Folder = 'folder',
}

export interface FileEntity {
  type: 'folder' | 'file'
  icon?: string
  indents?: number
  ino: number
  filePath: string
  parentPath: string
  size: number
  createdAt: Date
  modifiedAt: Date
  fileExtension?: string
}

export type TreeElement = TreeNode<FileEntity>

export interface ActiveIndent {
  activeParent: string
  activeNode: string
  indent: number
}

export interface SelectedTab {
  path: string
  index: number
  activeIndent?: ActiveIndent
}

export interface Tab {
  path: string
  fileName: string
  extension: string
  textContent: string
  deleted?: boolean
  modifiedAt?: Date
  createdAt?: Date
}

export interface AppConfig {
  baseDir?: string
  tabs?: Tab[]
  sideMenuWidth?: number
  editorTheme?: 'dark' | 'light'
}

export interface SearchResult {
  fileName: string
  extension: string
  content: string
  filePath: string
  iconName: string | undefined
  createdAt: Date
  modifiedAt: Date
  highlightContentText?: string | undefined
  highlightTitleText?: string | undefined
  highlightPathText?: string | undefined
}

export interface SearchPreference {
  value: string
  selected: boolean
  range?: {
    start?: Date
    end?: Date
  }
}
