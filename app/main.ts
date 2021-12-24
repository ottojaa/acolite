import { app, BrowserWindow, ipcMain, Menu, screen, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { IpcMainEvent, PopupOptions } from 'electron/main'
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
  copyFiles,
} from './ipc-events/file-events'
import {
  getBookmarkedFiles,
  getEmptyIndex,
  getRecentlyModifiedFiles,
  initAppState,
  searchFiles,
  updateStore,
} from './ipc-events/store-events'
import { getFileData, getImageDataBase64, getJoinedPath } from './electron-utils/file-utils'
import {
  ContextMenuActions,
  FileActions,
  FolderActions,
  HandlerAction,
  ReadFile,
  ReadImageData,
  SearchActions,
  StoreActions,
  StoreResponses,
  UpdateActionPayload,
} from './shared/actions'
import { Doc } from './shared/interfaces'
import { getEditorMenuItems } from './menu'

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
    icon: getJoinedPath([__dirname, 'acolite-logo-ellipse.png']),
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve ? true : false,
      contextIsolation: false, // false if you want to run e2e test with Spectron
    },
  })
  win.maximize()
  win.show()

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (serve) {
    win.webContents.openDevTools()
    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../node_modules/electron')),
    })
    win.loadURL('http://localhost:4200')
  } else {
    // Path when running electron executable
    const pathExists = fs.existsSync(path.join(__dirname, '../dist/index.html'))
    const pathIndex = pathExists ? '../dist/index.html' : './index.html'

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

const FolderActionChannels = [
  FolderActions.ChooseDir,
  FolderActions.ReadDir,
  FolderActions.MkDir,
  FolderActions.SetDefaultDir,
]

const FileActionChannels = [
  FileActions.Create,
  FileActions.Rename,
  FileActions.DeleteFiles,
  FileActions.MoveFiles,
  FileActions.ReadFile,
  FileActions.Update,
  FileActions.OpenFileLocation,
  FileActions.CopyFiles,
]

const StoreActionChannels = [
  StoreActions.GetStore,
  StoreActions.InitApp,
  StoreActions.UpdateStore,
  StoreActions.GetBookmarkedFiles,
  StoreActions.GetRecentlyModified,
]

const ContextMenuChannels = [ContextMenuActions.ShowEditorContextMenu]

const SearchActionChannels = [SearchActions.Query]

const startIPCChannelListeners = () => {
  FolderActionChannels.forEach((channel) => FolderActionReducer(channel))
  FileActionChannels.forEach((channel) => FileActionReducer(channel))
  StoreActionChannels.forEach((channel) => StoreActionReducer(channel))
  SearchActionChannels.forEach((channel) => SearchActionReducer(channel))
  ContextMenuChannels.forEach((channel) => ContextMenuReducer(channel))

  IPCHandlerReducer()
}

const SearchActionReducer = (action: SearchActions) => {
  ipcMain.on(action, (event: IpcMainEvent, payload: UpdateActionPayload) => {
    switch (payload.type) {
      case SearchActions.Query: {
        searchFiles(event, payload, index)
        break
      }
    }
  })
}

const StoreActionReducer = (action: StoreActions) => {
  ipcMain.on(action, (event: IpcMainEvent, payload: UpdateActionPayload) => {
    switch (payload.type) {
      case StoreActions.InitApp: {
        initAppState(event, configPath, index)
        break
      }
      case StoreActions.UpdateStore: {
        updateStore(event, payload, configPath)
        break
      }

      case StoreActions.GetBookmarkedFiles: {
        const { bookmarks } = payload
        const bookmarkedFiles = getBookmarkedFiles(index, bookmarks)
        event.sender.send(StoreResponses.GetBookmarkedFilesSuccess, { bookmarkedFiles })
        break
      }
      case StoreActions.GetRecentlyModified: {
        const recentlyModified = getRecentlyModifiedFiles(index)
        event.sender.send(StoreResponses.GetRecentlyModifiedSuccess, { recentlyModified })
        break
      }
    }
  })
}

const FolderActionReducer = (action: FolderActions) => {
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
    }
  })
}

const FileActionReducer = (action: FileActions) => {
  ipcMain.on(action, (event: IpcMainEvent, payload: UpdateActionPayload) => {
    switch (payload.type) {
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
      case FileActions.CopyFiles: {
        copyFiles(event, payload, index)
        break
      }
    }
  })
}

const ContextMenuReducer = (action: ContextMenuActions) => {
  ipcMain.on(action, (event: IpcMainEvent) => {
    switch (action) {
      case ContextMenuActions.ShowEditorContextMenu: {
        const menu = Menu.buildFromTemplate(getEditorMenuItems())
        menu.popup(<PopupOptions>BrowserWindow.fromWebContents(event.sender))
      }
    }
  })
}

const IPCHandlerReducer = () => {
  ipcMain.handle(HandlerAction.GetTabData, async (_event, action: ReadFile) => {
    const result = await getFileData(action.filePath)
    return result
  })
  ipcMain.handle(HandlerAction.GetImageBase64, async (_event, action: ReadImageData) => {
    const result = await getImageDataBase64(action.filePath)
    return result
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
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {}
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
