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
  FileActionResponses,
  FileActions,
  FolderActionResponses,
  FolderActions,
  MoveFiles,
  ReadDirectory,
  ReadFile,
  RenameFile,
  StoreActions,
  StoreResponses,
  UpdateActionPayload,
  UpdateFileContent,
  UpdateStore,
} from './actions'
import { getBaseName, getDirName, getExtension, getJoinedPath } from '../src/app/utils/file-utils'
import { cloneDeep, first, isObjectLike, isPlainObject } from 'lodash'
import { AppConfig, Tab, TreeElement } from '../src/app/interfaces/Menu'

type IPCChannelAction = FileActions | FolderActions | StoreActions
// Initialize remote module
require('@electron/remote/main').initialize()

let win: BrowserWindow = null
const defaultConfigFilePath = path.join(__dirname, 'acolite.config.json')
const configFileName = 'acolite.config.json'
const dirPath = app.getPath('appData')
const configPath = getJoinedPath([dirPath, configFileName])
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
  FileActions.Rename,
  FileActions.DeleteFiles,
  FileActions.MoveFiles,
  FileActions.ReadFile,
  FileActions.Update,
  StoreActions.GetStore,
  StoreActions.InitApp,
  StoreActions.UpdateStore,
]

const startIPCChannelListeners = () => {
  IPCChannels.forEach((channel) => IPCChannelReducer(channel))
}

const IPCChannelReducer = (action: IPCChannelAction) => {
  ipcMain.on(action, (event: IpcMainEvent, payload: UpdateActionPayload) => {
    switch (payload.type) {
      case FolderActions.MkDir: {
        createNewDirectory(event, payload)
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
        readAndSendMenuItemsFromBaseDirectory(event, payload)
        break
      }
      case FileActions.Create: {
        createFile(event, payload)
        break
      }
      case FileActions.Rename: {
        renameFile(event, payload)
        break
      }
      case FileActions.DeleteFiles: {
        deleteFiles(event, payload)
        break
      }
      case FileActions.MoveFiles: {
        moveFiles(event, payload)
        break
      }
      case FileActions.Update: {
        updateFileContent(event, payload)
        break
      }
      case FileActions.ReadFile: {
        readAndSendTabData(event, payload)
        break
      }
      case StoreActions.InitApp: {
        initAppState(event)
        break
      }
      case StoreActions.GetStore: {
        getStoreData(event)
        break
      }
      case StoreActions.UpdateStore: {
        updateStore(event, payload)
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

const initAppState = (event: IpcMainEvent) => {
  try {
    const defaultConfig = JSON.stringify({ baseDir: '' }, null, 2)
    const configExists = fs.existsSync(configPath)

    if (!configExists) {
      fs.writeFileSync(configPath, defaultConfig)
      event.sender.send(StoreResponses.InitAppSuccess)
    } else {
      const configBuffer = fs.readFileSync(configPath)
      const config: AppConfig = JSON.parse(configBuffer.toString())

      if (!isPlainObject(config)) {
        fs.writeFileSync(configPath, defaultConfig)
      }

      const updatedConfig = validateAndUpdateConfig(config)
      const updatedConfigJSON = JSON.stringify(updatedConfig, null, 2)
      fs.writeFileSync(configPath, updatedConfigJSON)

      const getPayload = () => {
        const baseDir = updatedConfig.baseDir
        return baseDir ? { ...updatedConfig, rootDirectory: getRootDirectory(baseDir) } : {}
      }
      event.sender.send(StoreResponses.InitAppSuccess, getPayload())
    }
  } catch (err) {
    console.log(err)
    event.sender.send(StoreResponses.InitAppFailure)
  }
}

const updateStore = (event: IpcMainEvent, updateData: UpdateStore) => {
  console.log(updateData)
  fs.readFile(configPath, (_err, data) => {
    const storeData = JSON.parse(data.toString())
    const updatedStoreData = JSON.stringify({ ...storeData, ...updateData }, null, 2)
    fs.writeFile(configPath, updatedStoreData, (err) => {
      if (err) {
        event.sender.send(StoreResponses.UpdateStoreFailure)
      }
      event.sender.send(StoreResponses.UpdateStoreSuccess)
    })
  })
}

const validateAndUpdateConfig = (config: AppConfig): AppConfig => {
  const validatedConfigVal = <K extends keyof AppConfig>(key: K) => {
    switch (key) {
      case 'tabs': {
        const getTabData = (path: string) => {
          if (!fs.existsSync(path)) {
            return null
          }
          const content = fs.readFileSync(path, 'utf-8')
          const fileStats = fs.statSync(path)
          return <Tab>{
            fileName: getBaseName(path),
            extension: getExtension(path),
            path: path,
            textContent: content,
            data: {
              lastUpdated: fileStats.mtime,
            },
          }
        }
        return config['tabs'].map((tab) => getTabData(tab.path)).filter((tab) => !!tab)
      }
      case 'baseDir': {
        const baseDir = config['baseDir']
        if (typeof baseDir === 'string' && fs.existsSync(baseDir)) {
          return baseDir
        }
        return ''
      }
      case 'sideMenuWidth': {
        const defaultWidth = 20
        const width = config['sideMenuWidth']
        if (typeof width === 'number') {
          const isValidWidth = Number.isInteger(width) && width >= 0 && width <= 100
          return isValidWidth ? width : defaultWidth
        }
        return defaultWidth
      }
      default: {
        break
      }
    }
  }
  const allowedKeys = ['baseDir', 'tabs', 'sideMenuWidth']
  const keys = Object.keys(config).filter((key) => allowedKeys.includes(key)) as (keyof AppConfig)[]

  return keys.reduce((acc, curr) => {
    acc[curr] = validatedConfigVal(curr)
    return acc
  }, {})
}

const createNewDirectory = (event: IpcMainEvent, payload: CreateNewDirectory) => {
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
        event.reply(FolderActionResponses.ChooseDirectorySuccess, filePathRef)
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

const readAndSendMenuItemsFromBaseDirectory = (event: IpcMainEvent, action: ReadDirectory) => {
  try {
    const rootDirectory = getRootDirectory(action.baseDir)
    event.sender.send(FolderActionResponses.ReadDirectorySuccess, rootDirectory)
  } catch (err) {
    console.log(err)
    event.sender.send(FolderActionResponses.ReadDirectoryFailure, err)
  }
}

const getRootDirectory = (baseDir: string): TreeElement => {
  const menuItems = getMenuItemsFromBaseDirectory(baseDir)
  const rootEntity = getFileEntityFromPath(baseDir)

  return { ...getTreeNodeFromFileEntity(rootEntity), children: menuItems }
}

const readAndSendTabData = (event: IpcMainEvent, action: ReadFile) => {
  const { filePath } = action.node.data
  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) {
      event.sender.send(FileActionResponses.ReadFailure)
      return
    }
    const fileStats = fs.statSync(filePath)
    const tabData: Tab = {
      fileName: getBaseName(filePath),
      extension: getExtension(filePath),
      path: filePath,
      textContent: content,
      data: {
        lastUpdated: fileStats.mtime,
      },
    }
    event.sender.send(FileActionResponses.ReadSuccess, tabData)
  })
}

const updateFileContent = (event: IpcMainEvent, action: UpdateFileContent) => {
  const { path, content } = action

  fs.writeFile(path, content, (err) => {
    if (err) {
      event.sender.send(FileActionResponses.UpdateFailure)
      return
    }

    const tabs = action.tabs
    const tabIdx = tabs.findIndex((tab) => tab.path === path)
    if (tabIdx > -1) {
      const fileStats = fs.statSync(path)
      tabs[tabIdx] = {
        ...tabs[tabIdx],
        textContent: content,
        data: {
          ...tabs[tabIdx].data,
          lastUpdated: fileStats.mtime,
        },
      }
      tabs[tabIdx].textContent = content
    }
    event.sender.send(FileActionResponses.UpdateSuccess, tabs)
  })
}

const createFile = (event: IpcMainEvent, action: CreateFile) => {
  const { path, rootDirectory } = action

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
  })
}

const renameFile = (event: IpcMainEvent, action: RenameFile) => {
  const { path, newName, rootDirectory } = action
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

const moveFiles = (event: IpcMainEvent, action: MoveFiles) => {
  const { target, elementsToMove, rootDirectory, tabs } = action
  const newParentPath = target.data.filePath
  const sortedElements = elementsToMove.sort((a, _b) => (a.type === 'folder' ? -1 : 1))
  const failedToMove = []

  const getNewPath = (currentPath: string, newParentPath: string) => {
    return getJoinedPath([currentPath.replace(currentPath, newParentPath), getBaseName(currentPath)])
  }

  const patchTabValue = (currentPath: string, newPath: string, tabs: Tab[]) => {
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
        patchTabValue(currentPath, newPath, tabs)

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
      event.sender.send(FileActionResponses.MoveSuccess, { rootDirectory, tabs })
    })
    .catch((err) => {
      console.log('Error while moving:', err)
      event.sender.send(FileActionResponses.MoveFailure)
    })
}

const deleteFiles = (event: IpcMainEvent, action: DeleteFiles) => {
  const { directoryPaths, filePaths, baseDir, rootDirectory } = action
  const paths = [...directoryPaths, ...filePaths]
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
}

const loop = () => {}

//////////// App data store /////////////

const getStoreData = (event: IpcMainEvent) => {
  const dirPath = app.getPath('appData')
  const configPath = getJoinedPath([dirPath, configFileName])

  const createStore = () => {
    const defaultPayload = JSON.stringify({ baseDir: '' }, null, 2)
    fs.writeFile(configPath, defaultPayload, (err) => {
      if (err) {
        event.sender.send(StoreResponses.CreateStoreFailure)
        return
      }
      event.sender.send(StoreResponses.CreateStoreSuccess)
    })
  }
}
