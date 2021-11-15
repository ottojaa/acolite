import { BrowserWindow, dialog, IpcMainEvent } from 'electron'
import { first } from 'lodash'
import * as path from 'path'
import * as fs from 'fs'
import { getUpdatedMenuItemsRecursive } from '../../src/app/utils/menu-utils'
import { CreateNewDirectory, FolderActionResponses, ReadDirectory } from '../actions'
import { getFileEntityFromPath, getRootDirectory } from '../utils'

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

export const chooseDirectory = (event: IpcMainEvent, window: BrowserWindow) => {
  dialog
    .showOpenDialog(window, {
      properties: ['openDirectory', 'createDirectory'],
    })
    .then((result) => {
      if (result.canceled) {
        event.reply(FolderActionResponses.ChooseDirectoryCanceled)
      } else if (result.filePaths) {
        // Take the dirPath chosen by the user and write it in the acolite.config.json to overwrite the base-url
        const filePathRef = result.filePaths[0]
        event.reply(FolderActionResponses.ChooseDirectorySuccess, filePathRef)
      }
    })
    .catch((err) => {
      event.reply(FolderActionResponses.ChooseDirectoryFailure, err)
    })
}

export const setDefaultDirectory = (event: IpcMainEvent, configPath: string) => {
  writeToFile(configPath, { key: 'baseDir', payload: __dirname })
    .then(() => {
      event.sender.send(FolderActionResponses.SetDefaultDirSuccess, __dirname)
    })
    .catch((err) => {
      event.sender.send(FolderActionResponses.SetDefaultDirFailure, err)
    })
}

export const readAndSendMenuItemsFromBaseDirectory = (event: IpcMainEvent, action: ReadDirectory) => {
  try {
    const rootDirectory = getRootDirectory(action.baseDir)
    event.sender.send(FolderActionResponses.ReadDirectorySuccess, rootDirectory)
  } catch (err) {
    console.log(err)
    event.sender.send(FolderActionResponses.ReadDirectoryFailure, err)
  }
}

const writeToFile = <T extends { key: string; payload: any }>(filePath: string, args: T): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) reject()
      const { payload, key } = args
      const configurationObject = JSON.parse(data)
      configurationObject[key] = payload

      const config = JSON.stringify(configurationObject, null, 2)
      fs.writeFile(filePath, config, (err) => {
        if (err) reject()
        resolve()
      })
    })
  })
}
