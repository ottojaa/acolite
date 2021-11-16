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

export interface TabState {
  selectedTab: number
  tabs: Tab[]
}

export interface Tab {
  path: string
  fileName: string
  extension: string
  textContent: string
  data?: {
    lastUpdated?: Date
  }
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
  createdDate: string
  modifiedDate: string
  highlightContentText?: string | undefined
  highlightTitleText?: string | undefined
  highlightPathText?: string | undefined
}
