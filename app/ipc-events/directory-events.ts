import { BrowserWindow, dialog, IpcMainEvent } from 'electron'
import { first } from 'lodash'
import * as path from 'path'
import * as fs from 'fs'
import { getUpdatedMenuItemsRecursive } from '../../src/app/utils/menu-utils'
import { CreateNewDirectory, FolderActionResponses, ReadDirectory } from '../actions'
import { getFileEntityFromPath, getRootDirectory } from '../utils'
import { addFilesToIndex, getEmptyIndex } from './store-events'
import { Document } from 'flexsearch'
import { Doc } from '../../src/app/interfaces/File'
import { changeSelectedWorkspace, getDefaultConfigJSON } from '../config-helpers/config-helpers'

export const createNewDirectory = (event: IpcMainEvent, payload: CreateNewDirectory) => {
  const { directoryName, baseDir, rootDirectory, parentPath } = payload
  const directoryPath = path.join(parentPath ? parentPath : baseDir, directoryName)
  fs.promises
    .mkdir(directoryPath, { recursive: true })
    .then(() => {
      const newDir = getFileEntityFromPath(directoryPath)
      const updatedRootDirectory = getUpdatedMenuItemsRecursive([rootDirectory], [newDir], 'create', {
        baseDir: rootDirectory.data.filePath,
      })

      const rootDir = first(updatedRootDirectory)

      event.sender.send(FolderActionResponses.MakeDirectorySuccess, rootDir)
    })
    .catch((err) => {
      event.sender.send(FolderActionResponses.MakeDirectoryFailure, err)
    })
}

export const chooseDirectory = (event: IpcMainEvent, window: BrowserWindow, configPath: string) => {
  dialog
    .showOpenDialog(window, {
      properties: ['openDirectory', 'createDirectory'],
    })
    .then((result) => {
      if (result.canceled) {
        event.reply(FolderActionResponses.ChooseDirectoryCanceled)
      } else if (result.filePaths) {
        // Take the dirPath chosen by the user and set it as selectedWorkspace in the acolite.config.json
        const selectedFilepath = first(result.filePaths)

        changeSelectedWorkspace(selectedFilepath, configPath).then(
          (data) => {
            event.reply(FolderActionResponses.ChooseDirectorySuccess, data)
          },
          (err) => {
            event.reply(FolderActionResponses.ChooseDirectoryFailure, err)
          }
        )
      }
    })
    .catch((err) => {
      event.reply(FolderActionResponses.ChooseDirectoryFailure, err)
    })
}

export const setDefaultDirectory = (event: IpcMainEvent, configPath: string, workspacePath: string) => {
  const defaultConfig = getDefaultConfigJSON(workspacePath)

  fs.writeFile(configPath, defaultConfig, (err) => {
    if (err) {
      event.sender.send(FolderActionResponses.SetDefaultDirFailure, err)
      return
    }
    event.sender.send(FolderActionResponses.SetDefaultDirSuccess, __dirname)
  })
}

export const readAndSendMenuItemsFromBaseDirectory = (
  event: IpcMainEvent,
  action: ReadDirectory,
  index: Document<Doc, true>
) => {
  try {
    const rootDirectory = getRootDirectory(action.baseDir)
    event.sender.send(FolderActionResponses.ReadDirectorySuccess, rootDirectory)
    addFilesToIndex(rootDirectory?.children, index)
  } catch (err) {
    console.log(err)
    event.sender.send(FolderActionResponses.ReadDirectoryFailure, err)
  }
}
