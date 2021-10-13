import * as path from 'path'
import * as fs from 'fs'

export interface FileEntity {
  type: 'folder' | 'file'
  filePath: string
  parentPath: string
  size: number
  createdAt: Date
  modifiedAt: Date
}

export const getFileEntityFromPath = (filePath: string): FileEntity => {
  const fileInfo = fs.statSync(filePath)
  const isFolder = fileInfo.isDirectory()

  const getExtension = (filename: string) => {
    const ext = path.extname(filename || '').split('.')
    return ext[ext.length - 1]
  }

  const getParentPath = (filePath: string) => {
    const lastIdx = filePath.lastIndexOf('/')
    return filePath.substring(0, lastIdx)
  }

  return {
    filePath,
    parentPath: getParentPath(filePath),
    type: isFolder ? 'folder' : 'file',
    size: fileInfo.size,
    createdAt: fileInfo.birthtime,
    modifiedAt: fileInfo.mtime,
    ...(!isFolder && { fileExtension: getExtension(filePath) }),
  }
}
