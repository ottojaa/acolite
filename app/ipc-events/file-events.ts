import * as fs from 'fs'
import { promises as fsp } from 'fs'
import { shell } from 'electron'
import { IpcMainEvent } from 'electron'
import { Document } from 'flexsearch'
import * as trash from 'trash'
import {
  getBaseName,
  getDirName,
  getExtension,
  getFileData,
  getJoinedPath,
  getNewPath,
} from '../electron-utils/file-utils'
import {
  getUpdatedMenuItemsRecursive,
  getUpdatedFilePathsRecursive,
  moveRecursive,
  replaceTreeNodeRecursive,
} from '../electron-utils/menu-utils'
import { getDeletedFileMock, getTreeElementFromPath, getTreeStructureFromBaseDirectory } from '../electron-utils/utils'
import {
  ReadFile,
  UpdateFileContent,
  CreateFile,
  RenameFile,
  MoveFiles,
  DeleteFiles,
  OpenFileLocation,
  FileActionResponses,
  FileActions,
  CopyFiles,
} from '../shared/ipc-actions'
import { Doc } from '../shared/interfaces'
import { first, cloneDeep } from 'lodash'
import { FileWatcher } from '../file-watcher/file-watcher'

export const readAndSendTabData = (event: IpcMainEvent, action: ReadFile) => {
  const { filePath } = action

  getFileData(filePath).then(
    (tabData) => {
      event.sender.send(FileActionResponses.ReadSuccess, { tabData })
    },
    (err) => {
      console.error(err)
      event.sender.send(FileActionResponses.ReadFailure)
    }
  )
}

export const updateFileContent = (event: IpcMainEvent, action: UpdateFileContent) => {
  const { filePath, content, state } = action
  const { tabs } = state

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      event.sender.send(FileActionResponses.UpdateFailure)
      return
    }

    updateTabData(tabs, filePath, content)

    event.sender.send(FileActionResponses.UpdateSuccess, { tabs })
  })
}

const updateTabData = (tabs: Doc[], oldTabPath: string, newContent?: string, newPath?: string): void => {
  const tabIdx = tabs.findIndex((tab) => tab.filePath === oldTabPath)
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
      tabs[tabIdx].fileContent = newContent
    }
    if (newPath) {
      tabs[tabIdx].filePath = newPath
    }
  }
}

export const createFile = (event: IpcMainEvent, action: CreateFile) => {
  const { filePath, openFileAfterCreation, content, state, encoding } = action
  const { rootDirectory, baseDir } = state
  const fileContent = (content || '').replace(/^data:([A-Za-z-+/]+);base64,/, '')

  fs.writeFile(filePath, fileContent, encoding, (err) => {
    if (err) {
      event.sender.send(FileActionResponses.CreateFailure, err)
      return
    }
    const file = getTreeElementFromPath(baseDir, filePath, false)
    const updatedRootDirectory = getUpdatedMenuItemsRecursive([rootDirectory], [file], 'create', {
      baseDir: rootDirectory.data.filePath,
    })

    const rootDir = first(updatedRootDirectory)

    event.sender.send(FileActionResponses.CreateSuccess, { rootDirectory: rootDir })

    if (openFileAfterCreation) {
      readAndSendTabData(event, { state, filePath, type: FileActions.ReadFile })
    }
  })
}

export const renameFile = (event: IpcMainEvent, action: RenameFile) => {
  const { filePath, newName, state } = action
  const { rootDirectory, tabs, baseDir } = state
  const parentDirectory = getDirName(filePath)
  const newPath = getJoinedPath([parentDirectory, newName])
  const oldPath = filePath

  fs.rename(filePath, newPath, (err) => {
    if (err) {
      event.sender.send(FileActionResponses.RenameFailure)
      return
    }
    const isFolder = fs.statSync(newPath).isDirectory()
    const file = getTreeElementFromPath(baseDir, newPath, isFolder)

    const updatedRootDirectory = getUpdatedMenuItemsRecursive([rootDirectory], [file], 'rename', {
      oldPath,
      newPath,
      isFolder,
      baseDir: rootDirectory.data.filePath,
    })
    const rootDir = first(updatedRootDirectory)

    updateTabData(tabs, filePath, null, newPath)

    event.sender.send(FileActionResponses.RenameSuccess, { rootDirectory: rootDir, tabs })
  })
}

export const moveFiles = (event: IpcMainEvent, action: MoveFiles) => {
  const { target, elementsToMove, state } = action
  const { rootDirectory, tabs } = state
  const newParentPath = target.data.filePath
  const sortedElements = elementsToMove.sort((a, _b) => (a.type === 'file' ? 1 : -1))
  const failedToMove = []

  const updateTabPath = (currentPath: string, newPath: string) => {
    const tabIdx = tabs.findIndex((tab) => tab.filePath === currentPath)
    if (tabIdx > -1) {
      tabs[tabIdx].filePath = newPath
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
    .then(async () => {
      const elementsToDelete = cloneDeep(sortedElements)
      const elementsToAdd = cloneDeep(sortedElements)
        .filter((el) => !failedToMove.includes(el.data.filePath))
        .map((treeEl) => {
          const oldPath = getDirName(treeEl.data.filePath)
          return getUpdatedFilePathsRecursive(treeEl, newParentPath, oldPath)
        })

      moveRecursive(elementsToAdd, elementsToDelete, [rootDirectory], { baseDir: rootDirectory.data.filePath })
      event.sender.send(FileActionResponses.MoveSuccess, { rootDirectory, tabs })
    })
    .catch((err) => {
      console.log('Error while moving:', err)
      event.sender.send(FileActionResponses.MoveFailure)
    })
}

export const deleteFiles = (event: IpcMainEvent, action: DeleteFiles, fileWatcher: FileWatcher) => {
  const { directoryPaths, filePaths, state } = action
  const { baseDir, rootDirectory, tabs } = state
  const paths = [...directoryPaths, ...filePaths]

  const markTabAsDeleted = (filePath: string) => {
    const tabIdx = tabs.findIndex((tab) => tab.filePath === filePath)
    if (tabIdx > -1) {
      tabs[tabIdx].deleted = true
    }
  }

  let failedToDelete = []

  const promises: Promise<void>[] = paths.map(
    (filePath) =>
      new Promise((resolve, reject) => {
        const stats = fs.statSync(filePath)
        const isDir = stats.isDirectory()

        trash(filePath)
          .then(() => {
            if (!isDir) {
              fileWatcher.onDeleteFile(stats.ino)
              markTabAsDeleted(filePath)
            }
            resolve()
          })
          .catch(() => {
            failedToDelete.push(filePath)
            reject()
          })
      })
  )
  Promise.all(promises).then(
    async () => {
      const filesToDelete = paths
        .filter((el) => !failedToDelete.includes(el))
        .map((filePath) => getDeletedFileMock(filePath))

      const updatedRootDirectory = getUpdatedMenuItemsRecursive([rootDirectory], filesToDelete, 'delete', { baseDir })
      const rootDir = first(updatedRootDirectory)
      event.sender.send(FileActionResponses.DeleteSuccess, { rootDirectory: rootDir, tabs })
    },
    (err) => {
      console.error(err)
      event.sender.send(FileActionResponses.DeleteFailure)
    }
  )
}

export const copyFiles = (event: IpcMainEvent, payload: CopyFiles, index: Document<Doc, true>) => {
  const { filePathsToCopy, state, target } = payload
  const { rootDirectory, baseDir } = state

  const failedToCopy = []

  const promises: Promise<void>[] = filePathsToCopy.map(
    (filePath) =>
      new Promise((resolve, reject) => {
        const currentPath = filePath
        const newPath = getNewPath(currentPath, target.data.filePath)
        const isDirectory = fs.lstatSync(currentPath).isDirectory()

        if (isDirectory) {
          copyDirectory(currentPath, newPath, index).then(
            () => {
              resolve()
            },
            (err: Error) => {
              reject(err)
            }
          )
        } else {
          fs.copyFile(currentPath, newPath, (err) => {
            if (err) {
              failedToCopy.push(currentPath)
              reject(err)
            }
            resolve()
          })
        }
      })
  )

  Promise.all(promises).then(
    async () => {
      const updatedTargetNodeChildren = await getTreeStructureFromBaseDirectory(target.data.filePath)
      const node = { ...target, children: updatedTargetNodeChildren }
      const updatedRootDir = first(replaceTreeNodeRecursive([rootDirectory], node, baseDir))

      event.sender.send(FileActionResponses.CopySuccess, { rootDirectory: updatedRootDir })
    },
    (err) => {
      event.sender.send(FileActionResponses.CopyFailure, err)
    }
  )
}

export const copyDirectory = async (src: string, dest: string, index: Document<Doc, true>) => {
  const [entries] = await Promise.all([fsp.readdir(src, { withFileTypes: true }), fsp.mkdir(dest, { recursive: true })])

  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = getJoinedPath([src, entry.name])
      const destPath = getJoinedPath([dest, entry.name])

      const copyFileFunc = async () => {
        await fsp.copyFile(srcPath, destPath)
      }

      entry.isDirectory() ? await copyDirectory(srcPath, destPath, index) : await copyFileFunc()
    })
  )
}

export const openFileLocation = (_event: IpcMainEvent, action: OpenFileLocation) => {
  shell.showItemInFolder(action.filePath)
}
