import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { IpcMainEvent } from 'electron/main'
import { getDeletedFileEntityMock, getFileEntityFromPath, getMenuItemsFromBaseDirectory } from './utils'
import {
  getTreeNodeFromFileEntity,
  getUpdatedFilePathsRecursive,
  getUpdatedMenuItemsRecursive,
  moveRecursive,
} from '../src/app/utils/menu-utils'
import {
  CreateFile,
  CreateNewDirectory,
  DeleteFiles,
  ElectronAction,
  FileActionResponses,
  FileActions,
  FolderActionResponses,
  FolderActions,
  MoveFiles,
  ReadDirectory,
  ReadFile,
  RenameFile,
} from './actions'
import { getBaseName, getDirName, getExtension, getJoinedPath } from '../src/app/utils/file-utils'
import { cloneDeep, first } from 'lodash'
import { Tab } from '../src/app/interfaces/Menu'

type IPCChannelAction = FileActions | FolderActions
// Initialize remote module
require('@electron/remote/main').initialize()

let win: BrowserWindow = null
const defaultConfigFilePath = path.join(__dirname, 'acolite.config.json')
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve')

function createWindow(): BrowserWindow {
  const electronScreen = screen

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve ? true : false,
      contextIsolation: false, // false if you want to run e2e test with Spectron
    },
  })
  win.maximize()
  win.show()

  if (serve) {
    win.webContents.openDevTools()
    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../node_modules/electron')),
    })
    win.loadURL('http://localhost:4200')
  } else {
    // Path when running electron executable
    let pathIndex = './index.html'

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html'
    }

    win.loadURL(
      url.format({
        pathname: path.join(__dirname, pathIndex),
        protocol: 'file:',
        slashes: true,
      })
    )
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  return win
}

const IPCChannels = [
  FolderActions.ChooseDir,
  FolderActions.ReadDir,
  FolderActions.MkDir,
  FolderActions.SetDefaultDir,
  FileActions.Create,
  FileActions.Delete,
  FileActions.Rename,
  FileActions.DeleteFiles,
  FileActions.MoveFiles,
  FileActions.ReadFile,
]

const startIPCChannelListeners = () => {
  IPCChannels.forEach((channel) => IPCChannelReducer(channel))
}

const IPCChannelReducer = (action: IPCChannelAction) => {
  ipcMain.on(action, (event: IpcMainEvent, payload: ElectronAction<unknown>) => {
    switch (action) {
      case FolderActions.MkDir: {
        createNewDirectory(event, <ElectronAction<CreateNewDirectory>>payload)
        break
      }
      case FolderActions.ChooseDir: {
        chooseDirectory(event)
        break
      }
      case FolderActions.SetDefaultDir: {
        setDefaultDirectory(event)
        break
      }
      case FolderActions.ReadDir: {
        readAndSendMenuItemsFromBaseDirectory(event, <ElectronAction<ReadDirectory>>payload)
        break
      }
      case FileActions.Create: {
        createFile(event, <ElectronAction<CreateFile>>payload)
        break
      }
      case FileActions.Rename: {
        renameFile(event, <ElectronAction<RenameFile>>payload)
        break
      }
      case FileActions.DeleteFiles: {
        deleteFiles(event, <ElectronAction<DeleteFiles>>payload)
        break
      }
      case FileActions.MoveFiles: {
        moveFiles(event, <ElectronAction<MoveFiles>>payload)
        break
      }
      case FileActions.ReadFile: {
        readAndSendTabData(event, <ElectronAction<ReadFile>>payload)
        break
      }
    }
  })
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400))

  startIPCChannelListeners()

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })
} catch (e) {
  // Catch Error
  // throw e;
}

/**
 *
 * @param filePath path to acolite.config.json
 * @param args object data to be added to the config
 */
export const writeToFile = <T extends { key: string; payload: any }>(filePath: string, args: T): Promise<void> => {
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

const createNewDirectory = (event: IpcMainEvent, payload: ElectronAction<CreateNewDirectory>) => {
  const { directoryName, baseDir, rootDirectory, parentPath } = payload.data
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

const chooseDirectory = (event: IpcMainEvent) => {
  dialog
    .showOpenDialog(win, {
      properties: ['openDirectory', 'createDirectory'],
    })
    .then((result) => {
      if (result.canceled) {
        event.reply(FolderActionResponses.ChooseDirectoryCanceled)
      } else if (result.filePaths) {
        // Take the dirPath chosen by the user and write it in the acolite.config.json to overwrite the base-url
        const filePathRef = result.filePaths[0]
        writeToFile(defaultConfigFilePath, { key: 'baseDir', payload: filePathRef })
          .then(() => {
            event.reply(FolderActionResponses.ChooseDirectorySuccess, filePathRef)
          })
          .catch((err) => {
            throw err
          })
      }
    })
    .catch((err) => {
      event.reply(FolderActionResponses.ChooseDirectoryFailure, err)
    })
}

const setDefaultDirectory = (event: IpcMainEvent) => {
  writeToFile(defaultConfigFilePath, { key: 'baseDir', payload: __dirname })
    .then(() => {
      event.sender.send(FolderActionResponses.SetDefaultDirSuccess, __dirname)
    })
    .catch((err) => {
      event.sender.send(FolderActionResponses.SetDefaultDirFailure, err)
    })
}

const readAndSendMenuItemsFromBaseDirectory = (event: IpcMainEvent, action: ElectronAction<ReadDirectory>) => {
  try {
    const menuItems = getMenuItemsFromBaseDirectory(action.data.baseDir)
    const rootEntity = getFileEntityFromPath(action.data.baseDir)
    const rootDirectory = { ...getTreeNodeFromFileEntity(rootEntity), children: menuItems }
    event.sender.send(FolderActionResponses.ReadDirectorySuccess, rootDirectory)
  } catch (err) {
    console.log(err)
    event.sender.send(FolderActionResponses.ReadDirectoryFailure, err)
  }
}

const readAndSendTabData = (event: IpcMainEvent, action: ElectronAction<ReadFile>) => {
  const { filePath } = action.data.node.data
  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) {
      event.sender.send(FileActionResponses.ReadFailure)
      return
    }
    const tabData: Tab = {
      fileName: getBaseName(filePath),
      extension: getExtension(filePath),
      path: filePath,
      textContent: content,
    }
    event.sender.send(FileActionResponses.ReadSuccess, tabData)
  })
}

const createFile = (event: IpcMainEvent, action: ElectronAction<CreateFile>) => {
  const { path, rootDirectory } = action.data

  fs.writeFile(path, '', (err) => {
    if (err) {
      event.sender.send(FileActionResponses.CreateFailure, err)
      return
    }
    const file = getFileEntityFromPath(path)
    const updatedRootDirectory = getUpdatedMenuItemsRecursive([rootDirectory], [file], 'create', {
      baseDir: rootDirectory.data.filePath,
    })

    const rootDir = first(updatedRootDirectory)

    event.sender.send(FileActionResponses.CreateSuccess, rootDir)
    /* writeToFile(defaultConfigFilePath, { key: 'menuItems', payload: updatedMenuItems }).then(
      () => {
        event.sender.send(FileActionResponses.CreateSuccess, updatedMenuItems)
      },
      (err) => {
        event.sender.send(FileActionResponses.CreateFailure, err)
      }
    ) */
  })
}

const renameFile = (event: IpcMainEvent, action: ElectronAction<RenameFile>) => {
  const { path, newName, rootDirectory } = action.data
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
    event.sender.send(FileActionResponses.RenameSuccess, rootDir)
  })
}

const moveFiles = (event: IpcMainEvent, action: ElectronAction<MoveFiles>) => {
  const { target, elementsToMove, rootDirectory, baseDir } = action.data
  const newParentPath = target.data.filePath
  const sortedElements = elementsToMove.sort((a, _b) => (a.type === 'folder' ? -1 : 1))
  const failedToMove = []

  const getNewPath = (currentPath: string, newParentPath: string) => {
    return getJoinedPath([currentPath.replace(currentPath, newParentPath), getBaseName(currentPath)])
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

      moveRecursive(elementsToAdd, elementsToDelete, [rootDirectory], { baseDir: rootDirectory.data.filePath })
      event.sender.send(FileActionResponses.MoveSuccess, rootDirectory)
    })
    .catch((err) => {
      console.log('Error while moving:', err)
      event.sender.send(FileActionResponses.MoveFailure)
    })
}

const deleteFiles = (event: IpcMainEvent, action: ElectronAction<DeleteFiles>) => {
  const { directoryPaths, filePaths, baseDir, rootDirectory } = action.data
  const paths = [...directoryPaths, ...filePaths]
  const totalCount = paths.length
  let failedToDelete = []

  const promises: Promise<void>[] = paths.map(
    (filePath) =>
      new Promise((resolve, reject) => {
        fs.rm(filePath, { recursive: true, force: true }, (err) => {
          if (err) {
            failedToDelete.push(filePath)
            reject()
          }
          resolve()
        })
      })
  )
  Promise.all(promises).then(
    () => {
      const files = paths
        .filter((el) => !failedToDelete.includes(el))
        .map((filePath) => getDeletedFileEntityMock(filePath))

      const updatedRootDirectory = getUpdatedMenuItemsRecursive([rootDirectory], files, 'delete', { baseDir })
      const rootDir = first(updatedRootDirectory)
      event.sender.send(FileActionResponses.DeleteSuccess, rootDir)
    },
    (err) => {
      console.error(err)
      event.sender.send(FileActionResponses.DeleteFailure)
    }
  )
  /* return new Promise((resolve, reject) => {
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
  }) */
}
