export enum MenuItemTypes {
  File = 'file',
  Folder = 'folder',
}

export interface FileEntity {
  filePath: string
  parentPath: string
  type: 'file'
  createdAt: Date
  modifiedAt: Date
  size: number
  fileExtension: string
}

export interface TreeElement {
  data: {
    filePath: string
    parentPath: string
    type: 'folder'
    createdAt: Date
    modifiedAt: Date
    size: number
  }
  children?: TreeElement[]
}
