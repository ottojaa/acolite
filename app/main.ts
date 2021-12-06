import { app, BrowserWindow, ipcMain, screen } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { IpcMainEvent } from 'electron/main'
import { FileActions, FolderActions, SearchActions, StoreActions, StoreResponses, UpdateActionPayload } from './actions'
import { getJoinedPath } from '../src/app/utils/file-utils'
import { Document } from 'flexsearch'
import {
  createNewDirectory,
  chooseDirectory,
  setDefaultDirectory,
  readAndSendMenuItemsFromBaseDirectory,
} from './ipc-events/directory-events'
import {
  createFile,
  renameFile,
  deleteFiles,
  moveFiles,
  updateFileContent,
  readAndSendTabData,
  openFileLocation,
} from './ipc-events/file-events'
import {
  getBookmarkedFiles,
  getEmptyIndex,
  getRecentlyModified,
  initAppState,
  searchFiles,
  updateStore,
} from './ipc-events/store-events'
import { Doc } from '../src/app/interfaces/File'

type IPCChannelAction = FileActions | FolderActions | StoreActions | SearchActions
// Initialize remote module
require('@electron/remote/main').initialize()

let win: BrowserWindow = null
const configFileName = 'acolite.config.json'
const dirPath = app.getPath('userData')
const defaultDocumentPath = getJoinedPath([app.getPath('documents'), 'Acolite'])
const configPath = getJoinedPath([dirPath, configFileName])
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve')

let index: Document<Doc, true>

function createWindow(): BrowserWindow {
  const electronScreen = screen

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    show: false,
    icon: getJoinedPath([__dirname, 'acolite.ico']),
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
  FileActions.OpenFileLocation,
  StoreActions.GetStore,
  StoreActions.InitApp,
  StoreActions.UpdateStore,
  StoreActions.GetRecentlyModified,
  StoreActions.GetBookmarkedFiles,
  SearchActions.Query,
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
        chooseDirectory(event, win, configPath)
        break
      }
      case FolderActions.SetDefaultDir: {
        setDefaultDirectory(event, configPath, defaultDocumentPath)
        break
      }
      case FolderActions.ReadDir: {
        index = getEmptyIndex()
        readAndSendMenuItemsFromBaseDirectory(event, payload, index)
        break
      }
      case FileActions.Create: {
        createFile(event, payload, index)
        break
      }
      case FileActions.Rename: {
        renameFile(event, payload, index)
        break
      }
      case FileActions.DeleteFiles: {
        deleteFiles(event, payload, index)
        break
      }
      case FileActions.MoveFiles: {
        moveFiles(event, payload, index)
        break
      }
      case FileActions.Update: {
        updateFileContent(event, payload, index)
        break
      }
      case FileActions.ReadFile: {
        readAndSendTabData(event, payload)
        break
      }
      case FileActions.OpenFileLocation: {
        openFileLocation(event, payload)
        break
      }
      case StoreActions.InitApp: {
        initAppState(event, configPath, index)
        break
      }
      case StoreActions.UpdateStore: {
        updateStore(event, payload, configPath)
        break
      }
      case SearchActions.Query: {
        searchFiles(event, payload, index)
        break
      }
      case StoreActions.GetRecentlyModified: {
        getRecentlyModified(event, index)
        break
      }
      case StoreActions.GetBookmarkedFiles: {
        getBookmarkedFiles(event, index, payload)
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

  index = getEmptyIndex()

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
  console.log(e)
  // Catch Error
  // throw e;
}
