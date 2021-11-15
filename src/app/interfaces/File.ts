export interface Tag {
  name: string
  bg: string
  color: string
}

export interface FileEntity {
  name: string
  extension: string
  type: 'file' | 'folder'
  content: string
  filePath: string
  iconName: string | undefined
  tags: Tag[]
  createdDate: string
  modifiedDate: string
  highlightContentText?: string | undefined
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
