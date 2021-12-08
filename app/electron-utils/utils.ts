import * as path from 'path'
import * as fs from 'fs'
import { folderStructureToMenuItems, getTreeNodeFromFileEntity } from './menu-utils'
import { getDirName, getPathSeparator } from './file-utils'
import { FileEntity, State, TreeElement } from '../shared/interfaces'
import { join } from 'path'

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

export const getRootDirectory = (baseDir: string): TreeElement => {
  const menuItems = getMenuItemsFromBaseDirectory(baseDir)
  const rootEntity = getFileEntityFromPath(baseDir)

  return { ...getTreeNodeFromFileEntity(rootEntity), children: menuItems }
}

export const getSelectedTabEntityFromIndex = (state: State, index: number) => {
  const { tabs, baseDir } = state
  const selectedTab = tabs[index]
  if (selectedTab) {
    return { path: tabs[index].path, index, activeIndent: getActiveIndent(baseDir, selectedTab.path) }
  } else {
    console.error(`No tab at index ${index}`)
    return null
  }
}

export const expandNodeRecursive = (root: TreeElement, path: string) => {
  const expandParentRecursive = (parentNode: TreeElement) => {
    if (parentNode) {
      parentNode.expanded = true
    }

    if (parentNode?.parent) {
      expandParentRecursive(parentNode.parent)
    }
  }
  const findParentNodeRecursive = (currentNode: TreeElement, path: string) => {
    for (const node of currentNode?.children) {
      if (node.data.filePath === path) {
        expandParentRecursive(node.parent)
        return
      } else if (node.children) {
        findParentNodeRecursive(node, path)
      }
    }
  }
  findParentNodeRecursive(root, path)
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
