import { TreeNode } from 'primeng/api'

export enum MenuItemTypes {
  File = 'file',
  Folder = 'folder',
}

export interface FileEntity {
  type: 'folder' | 'file'
  filePath: string
  parentPath: string
  size: number
  createdAt: Date
  modifiedAt: Date
  fileExtension?: string
}

export type TreeElement = TreeNode<FileEntity>
