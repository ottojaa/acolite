import * as fs from 'fs'
import { shell } from 'electron'
import { IpcMainEvent } from 'electron'
import { first, cloneDeep } from 'lodash'
import {
  ReadFile,
  FileActionResponses,
  UpdateFileContent,
  CreateFile,
  RenameFile,
  MoveFiles,
  DeleteFiles,
  FileActions,
  OpenFileLocation,
} from '../electron-interfaces'
import { Document } from 'flexsearch'
import { addToIndex, removeIndexes, updateIndex, updateIndexesRecursive } from './store-events'
import { getBaseName, getDirName, getExtension, getExtensionSplit, getJoinedPath } from '../electron-utils/file-utils'
import { Doc, Tab, TreeElement } from '../electron-interfaces'
import { getUpdatedMenuItemsRecursive, getUpdatedFilePathsRecursive, moveRecursive } from '../electron-utils/menu-utils'
import { getDeletedFileEntityMock, getFileEntityFromPath } from '../electron-utils/utils'

export const readAndSendTabData = (event: IpcMainEvent, action: ReadFile) => {
  const { filePath } = action
  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) {
      event.sender.send(FileActionResponses.ReadFailure)
      return
    }
    const fileStats = fs.statSync(filePath)
    const tabData: Tab = {
      fileName: getBaseName(filePath),
      extension: getExtensionSplit(filePath),
      path: filePath,
      textContent: content,
      modifiedAt: fileStats.mtime,
      createdAt: fileStats.birthtime,
    }
    event.sender.send(FileActionResponses.ReadSuccess, tabData)
  })
}

export const updateFileContent = (event: IpcMainEvent, action: UpdateFileContent, index: Document<Doc, true>) => {
  const { path, content } = action

  fs.writeFile(path, content, (err) => {
    if (err) {
      event.sender.send(FileActionResponses.UpdateFailure)
      return
    }

    const tabs = action.tabs

    updateTabData(tabs, path, content)
    updateIndex(path, index)

    event.sender.send(FileActionResponses.UpdateSuccess, tabs)
  })
}

const updateTabData = (tabs: Tab[], oldTabPath: string, newContent?: string, newPath?: string): void => {
  const tabIdx = tabs.findIndex((tab) => tab.path === oldTabPath)
  if (tabIdx > -1) {
    const pathToBeUsed = newPath ? newPath : oldTabPath
    const fileStats = fs.statSync(pathToBeUsed)
    const newName = getBaseName(pathToBeUsed)

    tabs[tabIdx] = {
      ...tabs[tabIdx],
      fileName: newName,
      modifiedAt: fileStats.mtime,
    }

    if (newContent) {
      tabs[tabIdx].textContent = newContent
    }
    if (newPath) {
      tabs[tabIdx].path = newPath
    }
  }
}

export const createFile = (event: IpcMainEvent, action: CreateFile, index: Document<Doc, true>) => {
  const { path, rootDirectory, openFileAfterCreation, content } = action
  const textContent = content || ''

  fs.writeFile(path, textContent, (err) => {
    if (err) {
      event.sender.send(FileActionResponses.CreateFailure, err)
      return
    }
    const file = getFileEntityFromPath(path)
    const updatedRootDirectory = getUpdatedMenuItemsRecursive([rootDirectory], [file], 'create', {
      baseDir: rootDirectory.data.filePath,
    })

    const rootDir = first(updatedRootDirectory)
    addToIndex(path, index)

    event.sender.send(FileActionResponses.CreateSuccess, rootDir)

    if (openFileAfterCreation) {
      readAndSendTabData(event, { filePath: path, type: FileActions.ReadFile })
    }
  })
}

export const renameFile = (event: IpcMainEvent, action: RenameFile, index: Document<Doc, true>) => {
  const { path, newName, rootDirectory, tabs } = action
  const parentDirectory = getDirName(path)
  const extension = getExtension(path)
  const newPath = getJoinedPath([parentDirectory, newName]) + extension
  const oldPath = path

  fs.rename(path, newPath, (err) => {
    if (err) {
      event.sender.send(FileActionResponses.RenameFailure)
      return
    }
    const file = getFileEntityFromPath(newPath)
    const fileInfo = fs.statSync(newPath)
    const isFolder = fileInfo.isDirectory()

    const updatedRootDirectory = getUpdatedMenuItemsRecursive([rootDirectory], [file], 'rename', {
      oldPath,
      newPath,
      isFolder,
      baseDir: rootDirectory.data.filePath,
    })
    const rootDir = first(updatedRootDirectory)

    updateTabData(tabs, path, null, newPath)
    updateIndexesRecursive([newPath], index)

    event.sender.send(FileActionResponses.RenameSuccess, { rootDir, tabs })
  })
}

export const moveFiles = (event: IpcMainEvent, action: MoveFiles, index: Document<Doc, true>) => {
  const { target, elementsToMove, rootDirectory, tabs } = action
  const newParentPath = target.data.filePath
  const sortedElements = elementsToMove.sort((a, _b) => (a.type === 'file' ? 1 : -1))
  const failedToMove = []

  const getNewPath = (currentPath: string, newParentPath: string) => {
    return getJoinedPath([currentPath.replace(currentPath, newParentPath), getBaseName(currentPath)])
  }

  const updateTabPath = (currentPath: string, newPath: string) => {
    const tabIdx = tabs.findIndex((tab) => tab.path === currentPath)
    if (tabIdx > -1) {
      tabs[tabIdx].path = newPath
    }
  }

  const promises: Promise<void>[] = sortedElements.map(
    (element) =>
      new Promise((resolve, reject) => {
        const currentPath = element.data.filePath
        const newPath = getNewPath(currentPath, newParentPath)

        fs.rename(currentPath, newPath, (err) => {
          if (err) {
            failedToMove.push(currentPath)
            reject(err)
          }
          updateTabPath(currentPath, newPath)
          resolve()
        })
      })
  )
  Promise.all(promises)
    .then(() => {
      const elementsToDelete = cloneDeep(sortedElements)
      const elementsToAdd = cloneDeep(sortedElements)
        .filter((el) => !failedToMove.includes(el.data.filePath))
        .map((treeEl) => {
          const oldPath = getDirName(treeEl.data.filePath)
          return getUpdatedFilePathsRecursive(treeEl, newParentPath, oldPath)
        })

      updateIndexesRecursive(
        elementsToAdd.map((el) => el.data.filePath),
        index
      )
      moveRecursive(elementsToAdd, elementsToDelete, [rootDirectory], { baseDir: rootDirectory.data.filePath })
      event.sender.send(FileActionResponses.MoveSuccess, { rootDirectory, tabs })
    })
    .catch((err) => {
      console.log('Error while moving:', err)
      event.sender.send(FileActionResponses.MoveFailure)
    })
}

export const deleteFiles = (event: IpcMainEvent, action: DeleteFiles, index: Document<Doc, true>) => {
  const { directoryPaths, filePaths, baseDir, rootDirectory, tabs } = action
  const paths = [...directoryPaths, ...filePaths]

  // Gather all inode-values prior to deleting, so we can remove the files' indexes if the deletions were succesfull
  const getInodesRecursive = (el: TreeElement, inodes: number[] = []) => {
    if (paths.includes(el.data.filePath)) {
      inodes.push(el.data.ino)
    }
    if (el.children?.length) {
      for (let child of el.children) {
        getInodesRecursive(child, inodes)
      }
    }
    return inodes
  }

  const markTabAsDeleted = (filePath: string) => {
    const tabIdx = tabs.findIndex((tab) => tab.path === filePath)
    if (tabIdx > -1) {
      tabs[tabIdx].deleted = true
    }
  }

  const inodes = getInodesRecursive(rootDirectory)

  let failedToDelete = []

  const promises: Promise<void>[] = paths.map(
    (filePath) =>
      new Promise((resolve, reject) => {
        fs.rm(filePath, { recursive: true, force: true }, (err) => {
          if (err) {
            failedToDelete.push(filePath)
            reject()
          }

          markTabAsDeleted(filePath)
          resolve()
        })
      })
  )
  Promise.all(promises).then(
    () => {
      removeIndexes(inodes, index)

      const files = paths
        .filter((el) => !failedToDelete.includes(el))
        .map((filePath) => getDeletedFileEntityMock(filePath))

      const updatedRootDirectory = getUpdatedMenuItemsRecursive([rootDirectory], files, 'delete', { baseDir })
      const rootDir = first(updatedRootDirectory)
      event.sender.send(FileActionResponses.DeleteSuccess, { rootDir, tabs })
    },
    (err) => {
      console.error(err)
      event.sender.send(FileActionResponses.DeleteFailure)
    }
  )
}

export const openFileLocation = (_event: IpcMainEvent, action: OpenFileLocation) => {
  shell.showItemInFolder(action.filePath)
}
