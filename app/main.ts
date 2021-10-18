import { app, BrowserWindow, ipcMain, IpcMessageEvent, Menu, screen, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { stringify, parse, fromJSON } from 'flatted'
import { IpcMainEvent } from 'electron/main'
import { getFileEntityFromPath, getMenuItemsFromBaseDirectory, getTreeStructureFromBaseDirectory } from './utils'
import { getTreeNodeFromFolder, getUpdatedMenuItemsRecursive } from '../src/app/utils/menu-utils'
import {
  CreateFile,
  CreateNewDirectory,
  ElectronAction,
  FileActionResponses,
  FileActions,
  FolderActionResponses,
  FolderActions,
  ReadDirectory,
} from './actions'

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
 * Used to update the config file. JSON files cannot contain circular references (menuItems), so we have to (de)serialize with a library
 * that replaces object references in a way that circumvents the problem (flatted replaces property values with indexes).
 * @param filePath path to acolite.config.json
 * @param args object data to be added to the config
 */
const writeToFile = <T extends { payload: any; key: string }>(filePath: string, args: T): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject()
      const { payload, key } = args
      const configurationObject = JSON.parse(data.toString())
      configurationObject[key] = payload[key]

      const config = stringify(configurationObject, null, 2)
      fs.writeFile(filePath, config, (err) => {
        if (err) reject()
        resolve()
      })
    })
  })
}

const createNewDirectory = (event: IpcMainEvent, payload: ElectronAction<CreateNewDirectory>) => {
  const { directoryName, baseDir, menuItems, parentPath } = payload.data
  const directoryPath = path.join(parentPath ? parentPath : baseDir, directoryName)
  fs.promises
    .mkdir(directoryPath, { recursive: true })
    .then(() => {
      const newDir = getFileEntityFromPath(directoryPath)
      const updatedMenuItems = parentPath
        ? getUpdatedMenuItemsRecursive(menuItems, newDir)
        : [...menuItems, getTreeNodeFromFolder(newDir)]

      event.sender.send(FolderActionResponses.MakeDirectorySuccess, updatedMenuItems)
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
        const filePathRef = { baseDir: result.filePaths[0] }
        writeToFile(defaultConfigFilePath, { key: 'baseDir', payload: filePathRef })
          .then(() => {
            event.reply(FolderActionResponses.ChooseDirectorySuccess, result.filePaths[0])
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
  const filePathRef = { baseDir: __dirname }
  writeToFile(defaultConfigFilePath, { key: 'baseDir', payload: filePathRef })
    .then(() => {
      event.sender.send(FolderActionResponses.SetDefaultDirSuccess)
    })
    .catch((err) => {
      event.sender.send(FolderActionResponses.SetDefaultDirFailure, err)
    })
}

const readAndSendMenuItemsFromBaseDirectory = (event: IpcMainEvent, action: ElectronAction<ReadDirectory>) => {
  try {
    const menuItems = getMenuItemsFromBaseDirectory(action.data.baseDir)
    event.sender.send(FolderActionResponses.ReadDirectorySuccess, menuItems)
  } catch (err) {
    console.log(err)
    event.sender.send(FolderActionResponses.ReadDirectoryFailure, err)
  }
}

const createFile = (event: IpcMainEvent, action: ElectronAction<CreateFile>) => {
  const { path, menuItems } = action.data

  fs.writeFile(path, '', (err) => {
    if (err) {
      event.sender.send(FileActionResponses.CreateFailure, err)
    }
    const file = getFileEntityFromPath(path)
    const updatedMenuItems = getUpdatedMenuItemsRecursive(menuItems, file)
    event.sender.send(FileActionResponses.CreateSuccess, updatedMenuItems)
    /* writeToFile(defaultConfigFilePath, { key: 'menuItems', payload: { menuItems: updatedMenuItems } }).then(
      () => {
        event.sender.send(FileActionResponses.CreateSuccess, updatedMenuItems)
      },
      (err) => {
        event.sender.send(FileActionResponses.CreateFailure, err)
      }
    ) */
  })
}
