import * as path from 'path'
import * as fs from 'fs'
import { join } from 'path'
import { FileEntity, TreeElement } from '../src/app/interfaces/Menu'
import { folderStructureToMenuItems } from '../src/app/utils/menu-utils'

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

export const getMenuItemsFromBaseDirectory = (baseDir: string) => {
  const treeStructure = getTreeStructureFromBaseDirectory(baseDir)
  return folderStructureToMenuItems(baseDir, treeStructure)
}

export const getTreeStructureFromBaseDirectory = (baseDir: string) => {
  const directoryPath = baseDir

  const isDirectory = (path: string) => fs.statSync(path).isDirectory()
  const getDirectories = (fileEntity: FileEntity) =>
    fs
      .readdirSync(fileEntity.filePath)
      .map((name) => join(fileEntity.filePath, name))
      .filter(isDirectory)
      .map(getFileEntityFromPath)

  const isFile = (path: string) => fs.statSync(path).isFile()
  const getFiles = (fileEntity: FileEntity) =>
    fs
      .readdirSync(fileEntity.filePath)
      .map((name) => join(fileEntity.filePath, name))
      .filter(isFile)
      .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item)) // Filter hidden files such as .DS_Store
      .map(getFileEntityFromPath)

  const getFilesRecursively = (file: FileEntity): (TreeElement | FileEntity)[] => {
    let dirs = getDirectories(file)
    let files: (TreeElement | FileEntity)[] = dirs.map((dir) => {
      return {
        data: dir,
        children: getFilesRecursively(dir).reduce(
          (directoryDescendants: (TreeElement | FileEntity)[], descendant: TreeElement | FileEntity) =>
            directoryDescendants.concat(descendant),
          []
        ),
      }
    })
    return files.concat(getFiles(file))
  }

  const rootFolder = getFileEntityFromPath(directoryPath)
  return getFilesRecursively(rootFolder)
}
