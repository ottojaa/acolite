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
  selectedTab?: number
  editorTheme?: 'dark' | 'light'
}

export interface AppConfig {
  selectedWorkspace?: string
  workspaces: WorkspaceConfig[]
}

export type TreeElement = TreeNode<FileEntity>

export interface State {
  baseDir: string
  initialized: boolean
  selectedTab: number
  editorTheme: 'dark' | 'light'
  sideMenuWidth: number
  searchResults: SearchResult[]
  tabs: Tab[]
  rootDirectory: TreeElement
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

export interface Tab {
  path: string
  fileName: string
  extension: string
  textContent: string
  deleted?: boolean
  data?: {
    lastUpdated?: Date
  }
}
