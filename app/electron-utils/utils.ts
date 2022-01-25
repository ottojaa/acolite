import * as path from 'path'
import * as fs from 'fs'
import { calculateIndents } from './menu-utils'
import { getBaseName, getDirName, getPathSeparator } from './file-utils'
import { MenuItemTypes, SelectedTab, State, TreeElement } from '../shared/interfaces'
import { join } from 'path'
import { ValidatorFn, AbstractControl } from '@angular/forms'

export const getTreeElementFromPath = (baseDir: string, filePath: string, isFolder: boolean): TreeElement => {
  const getExtension = (filename: string) => {
    const ext = path.extname(filename || '').split('.')
    return ext[ext.length - 1]
  }
  const type = isFolder ? MenuItemTypes.Folder : MenuItemTypes.File
  const fileExtension = isFolder ? null : getExtension(filePath)
  const label = getBaseName(filePath)
  const parentPath = getDirName(filePath)
  const indents = calculateIndents(filePath, baseDir)

  return {
    type,
    label,
    key: filePath,
    leaf: !isFolder,
    data: {
      filePath,
      parentPath,
      indents,
      ...(!isFolder && { fileExtension }),
    },
    ...(isFolder && { children: [] }),
  }
}

/**
 * Since the file entity does not exist after deletion, we need to mock it
 */
export const getDeletedFileMock = (filePath: string): TreeElement => {
  return {
    data: {
      filePath,
      parentPath: getDirName(filePath),
    },
  }
}

export const getTreeStructureFromBaseDirectory = (baseDir: string) => {
  const directoryPath = baseDir

  const getDirectories = (fileEntity: TreeElement) =>
    fs
      .readdirSync(fileEntity.data.filePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => join(fileEntity.data.filePath, dirent.name))
      .filter((name) => !name.includes('_thumbnails'))
      .map((dirPath) => getTreeElementFromPath(baseDir, dirPath, true))

  const getFiles = (fileEntity: TreeElement) =>
    fs
      .readdirSync(fileEntity.data.filePath, { withFileTypes: true })
      .filter((dirent) => !dirent.isDirectory())
      .map((dirent) => join(fileEntity.data.filePath, dirent.name))
      .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item)) // Filter hidden files such as .DS_Store
      .map((filePath) => getTreeElementFromPath(baseDir, filePath, false))

  const getFilesRecursively = (file: TreeElement): TreeElement[] => {
    let dirs = getDirectories(file)
    let files: TreeElement[] = dirs.map((dir) => {
      return {
        ...dir,
        children: getFilesRecursively(dir).reduce(
          (directoryDescendants: TreeElement[], descendant: TreeElement) => directoryDescendants.concat(descendant),
          []
        ),
      }
    })
    return files.concat(getFiles(file))
  }

  const rootFolder = getTreeElementFromPath(baseDir, directoryPath, true)
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

export const getRootDirectory = (baseDir: string): TreeElement => {
  const rootTreeElement = getTreeElementFromPath(baseDir, baseDir, true)
  const menuItems = getTreeStructureFromBaseDirectory(baseDir)

  return { ...rootTreeElement, children: menuItems }
}

export const isBannedValue = (bannedValues: string[]): ValidatorFn => {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (bannedValues.indexOf(c.value) !== -1) {
      return { forbiddenValues: true }
    }
    return null
  }
}
