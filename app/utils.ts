import * as path from 'path'
import * as fs from 'fs'
import { join } from 'path'
import { FileEntity, TreeElement } from '../src/app/interfaces/Menu'
import { folderStructureToMenuItems } from '../src/app/utils/menu-utils'
import { getDirName, getPathSeparator } from '../src/app/utils/file-utils'
import { cloneDeep } from 'lodash'
import { FilePathContainer } from '../src/app/interfaces/File'

export const getFileEntityFromPath = (filePath: string): FileEntity => {
  const fileInfo = fs.statSync(filePath)
  const isFolder = fileInfo.isDirectory()
  const getExtension = (filename: string) => {
    const ext = path.extname(filename || '').split('.')
    return ext[ext.length - 1]
  }
  const getIcon = (extension: string) => extension + '.svg'
  const fileExtension = isFolder ? null : getExtension(filePath)
  const icon = isFolder ? null : getIcon(fileExtension)

  return {
    filePath,
    parentPath: getDirName(filePath),
    type: isFolder ? 'folder' : 'file',
    size: fileInfo.size,
    createdAt: fileInfo.birthtime,
    modifiedAt: fileInfo.mtime,
    ...(!isFolder && { fileExtension, icon }),
  }
}

/**
 * Since the file entity does not exist after deletion, we can just mock it
 */
export const getDeletedFileEntityMock = (filePath: string): FileEntity => {
  return {
    filePath,
    parentPath: getDirName(filePath),
    type: 'file',
    size: 0,
    createdAt: new Date(),
    modifiedAt: new Date(),
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

export const patchCollectionBy = <T, K extends keyof T>(collection: T[], newEl: T, key: K) => {
  const copy = collection.slice(0)
  const index = copy.findIndex((el) => el[key] === newEl[key])

  if (index > -1) {
    copy[index] = newEl
  } else {
    console.error(`no element with identifier ${key} === ${newEl[key]} found in collection`)
  }

  return copy
}
