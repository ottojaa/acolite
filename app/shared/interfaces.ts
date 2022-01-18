import { TreeNode } from 'primeng/api'

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

export interface ConfirmDialogConfig {
  title?: string
  content?: string
  fileList?: TreeElement[]
  buttonLabels?: {
    confirm?: string
    cancel?: string
  }
}

export interface WorkspaceConfig {
  baseDir?: string
  tabs?: Doc[]
  sideMenuWidth?: number
  selectedTab?: SelectedTab
  editorTheme?: 'dark' | 'light'
  appTheme?: string
  searchPreferences?: SearchPreference[]
  bookmarks?: string[]
}

export interface AppConfig {
  selectedWorkspace?: string
  workspaces: WorkspaceConfig[]
}

export type TreeElement = TreeNode<FileEntity>

export interface State {
  baseDir: string
  initialized: boolean
  indexing: boolean
  indexingReady: boolean
  selectedTab: SelectedTab
  editorTheme: 'dark' | 'light'
  appTheme: string
  sideMenuWidth: number
  searchPreferences: SearchPreference[]
  searchResults: SearchResult[]
  tabs: Doc[]
  rootDirectory: TreeElement
  bookmarks: string[]
}

export enum MenuItemTypes {
  File = 'file',
  Folder = 'folder',
}

export interface ActiveIndent {
  activeParent: string
  activeNode: string
  indent: number
}

export interface SelectedTab {
  filePath: string
  index: number
  forceDashboard: boolean
  activeIndent?: ActiveIndent
}

export interface SearchResult {
  fileName: string
  extension: string
  fileContent: string
  filePath: string
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

export interface Tag {
  name: string
  bg: string
  color: string
}

export interface FilePathContainer {
  folders: string[]
  files: string[]
}

export interface EditorConfig {
  editorType: string
  encoding: Encoding | undefined
}

export interface Doc {
  ino: number
  filePath: string
  fileName: string
  extension: string
  editorConfig: EditorConfig
  modifiedAt: Date
  createdAt: Date
  size: number
  fileContent?: string
  deleted?: boolean
}

export interface ThemeOption {
  name: string
  styles: Record<string, string>
}

export type Encoding = 'utf-8' | 'binary' | 'base64'
