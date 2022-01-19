import * as path from 'path'
import * as fs from 'fs'
import { folderStructureToMenuItems, getTreeNodeFromFileEntity } from './menu-utils'
import { getBaseName, getDirName, getJoinedPath, getPathSeparator } from './file-utils'
import { FileEntity, MenuItemTypes, SelectedTab, State, TreeElement } from '../shared/interfaces'
import { join } from 'path'
import { ValidatorFn, AbstractControl } from '@angular/forms'

export const getFileEntityFromPath = (filePath: string): FileEntity => {
  const fileInfo = fs.statSync(filePath)
  const isFolder = fileInfo.isDirectory()
  const getExtension = (filename: string) => {
    const ext = path.extname(filename || '').split('.')
    return ext[ext.length - 1]
  }
  const fileExtension = isFolder ? null : getExtension(filePath)

  return {
    filePath,
    ino: fileInfo.ino,
    parentPath: getDirName(filePath),
    type: isFolder ? 'folder' : 'file',
    size: fileInfo.size,
    createdAt: fileInfo.birthtime,
    modifiedAt: fileInfo.mtime,
    ...(!isFolder && { fileExtension }),
  }
}

/**
 * Since the file entity does not exist after deletion, we need to mock it
 */
export const getDeletedFileEntityMock = (filePath: string): FileEntity => {
  return {
    filePath,
    ino: 0,
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
      .filter((name) => !name.includes('_thumbnails'))
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

  const getFilesRecursively = (file: FileEntity): TreeElement[] => {
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

export const getTreeElementsFromFilePath = (baseDir: string) => {
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
      .map((file) => getTreeNodeFromFileEntity(file))

  const getFilesRecursively = (file: FileEntity): TreeElement[] => {
    let dirs = getDirectories(file)
    let files: (TreeElement | FileEntity)[] = dirs.map((dir) => {
      return {
        data: dir,
        label: getBaseName(dir.filePath),
        expanded: true,
        leaf: false,
        key: dir.filePath,
        type: MenuItemTypes.Folder,
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

export const getRootDirectory = (baseDir: string): TreeElement => {
  const rootEntity = getFileEntityFromPath(baseDir)
  const rootTreeNode = getTreeNodeFromFileEntity(rootEntity)
  const menuItems = getMenuItemsFromBaseDirectory(baseDir)

  return { ...rootTreeNode, children: menuItems }
}

export const getSelectedTabEntityFromIndex = (state: State, index: number): SelectedTab => {
  const { tabs, baseDir } = state
  const selectedTab = tabs[index]
  if (selectedTab) {
    const filePath = tabs[index].filePath
    const activeIndent = getActiveIndent(baseDir, selectedTab.filePath)

    return { filePath, index, activeIndent, forceDashboard: false }
  } else {
    console.error(`No tab at index ${index}`)
    return null
  }
}

export const expandNodeRecursive = (root: TreeElement, path: string) => {
  const rootPath = root.data.filePath
  const nodeParent = getDirName(path)
  const diff = nodeParent.replace(rootPath, '')

  const getPathsToExpand = () => {
    const paths = diff.split(getPathSeparator())
    let lastPath = rootPath

    const resultPaths = paths.map((nodePath) => {
      lastPath = getJoinedPath([lastPath, nodePath])
      return lastPath
    })
    return resultPaths.filter((el) => el !== rootPath)
  }

  const pathsToExpand = getPathsToExpand()

  const expandRecursive = (node: TreeElement) => {
    node.expanded = true
    if (node.children) {
      node.children.forEach((childNode) => {
        expandRecursive(childNode)
      })
    }
  }

  if (pathsToExpand.length) {
    root.children.forEach((child) => {
      if (pathsToExpand.includes(child.data.filePath)) {
        expandRecursive(child)
      }
    })
  }
}

export const getActiveIndent = (rootPath: string, path: string) => {
  if (!rootPath || !path) {
    return undefined
  }
  const pathDiff = path.replace(rootPath, '')
  const pathDepth = pathDiff.split(getPathSeparator()).length - 2
  const parentPath = getDirName(path)
  if (parentPath) {
    return { activeParent: parentPath, activeNode: path, indent: pathDepth }
  }
  return null
}

export const isBannedValue = (bannedValues: string[]): ValidatorFn => {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (bannedValues.indexOf(c.value) !== -1) {
      return { forbiddenValues: true }
    }
    return null
  }
}
