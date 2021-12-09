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

export interface WorkspaceConfig {
  baseDir?: string
  tabs?: Tab[]
  sideMenuWidth?: number
  selectedTab?: SelectedTab
  editorTheme?: 'dark' | 'light'
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
  selectedTab: SelectedTab
  editorTheme: 'dark' | 'light'
  sideMenuWidth: number
  searchPreferences: SearchPreference[]
  searchResults: SearchResult[]
  tabs: Tab[]
  rootDirectory: TreeElement
  bookmarks: string[]
  bookmarkedFiles: Doc[]
  recentlyModified: Doc[]
}

export interface Tab {
  path: string
  fileName: string
  extension: string
  textContent: string
  deleted?: boolean
  createdAt?: Date
  modifiedAt?: Date
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
  path: string
  index: number
  forceDashboard: boolean
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

export interface SearchResult {
  fileName: string
  extension: string
  content: string
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

export interface Doc {
  ino: number
  filePath: string
  fileName: string
  extension: string
  content: string
  modifiedAt: Date
  createdAt: Date
}

export interface ThemeOption {
  name: string
  styles: Record<string, string>
}
