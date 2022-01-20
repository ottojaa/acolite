import { app, BrowserWindow, ipcMain, Menu, nativeImage, screen, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { checkForUpdates, downloadUpdate, quitAndInstall } from './updater'
import { IpcMainEvent, PopupOptions } from 'electron/main'
import { Document } from 'flexsearch'
import {
  createNewDirectory,
  chooseDirectory,
  setDefaultDirectory,
  readAndSendMenuItemsFromBaseDirectory,
  getDirectoryPath,
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
import { getDirName, getFileContent, getJoinedPath } from './electron-utils/file-utils'
import {
  ContextMenuActions,
  FileActions,
  FolderActions,
  HandlerAction,
  ChooseDirectory,
  SearchActions,
  StoreActions,
  UpdateActionPayload,
  ReadFileContent,
  AutoUpdateEvent,
  GetThumbnail,
  GetBookmarkedFiles,
  GetRecentlyModified,
} from './shared/actions'
import { Doc } from './shared/interfaces'
import { getEditorMenuItems } from './menu'
import { FileWatcher } from './file-watcher/file-watcher'
import { getThumbnail } from './thumbnail-helpers/thumbnail-helpers'

// Initialize remote module
require('@electron/remote/main').initialize()

let win: BrowserWindow = null
const configFileName = 'acolite.config.json'
process.traceProcessWarnings = true
const dirPath = app.getPath('userData')
const defaultDocumentPath = getJoinedPath([app.getPath('documents'), 'Acolite'])
const configPath = getJoinedPath([dirPath, configFileName])
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve')

let index: Document<Doc, true>
let fileWatcher = new FileWatcher()

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

  const loadURLWhenRunningExecutable = () => {
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

  if (serve) {
    win.webContents.openDevTools()
    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../node_modules/electron')),
    })
    win.loadURL('http://localhost:4200')
  } else {
    loadURLWhenRunningExecutable()
  }

  win.webContents.on('did-fail-load', () => {
    loadURLWhenRunningExecutable()
  })

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
  StoreActions.InitFileWatcher,
  StoreActions.UpdateStore,
  StoreActions.GetBookmarkedFiles,
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
  AutoUpdateListener()
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
      case StoreActions.InitFileWatcher: {
        initFileWatcher(payload.filePath)
        break
      }
    }
  })
}

/**
 * Chokidar event listeners remain after restart even when destroying the class instance.
 * First remove all existing listeners if present, then destroy the instance and then create a new one
 */
const initFileWatcher = (filePath: string) => {
  fileWatcher.removeAllExistingListeners()
  fileWatcher = null
  fileWatcher = new FileWatcher()
  fileWatcher.startWatcher(filePath, win, index)
}

const AutoUpdateListener = () => {
  ipcMain.on(AutoUpdateEvent.StartAutoUpdater, (_event: IpcMainEvent) => {
    checkForUpdates(win)
  })
  ipcMain.on(AutoUpdateEvent.DownloadUpdate, (_event: IpcMainEvent) => {
    downloadUpdate()
  })
  ipcMain.on(AutoUpdateEvent.QuitAndInstall, (_event: IpcMainEvent) => {
    quitAndInstall(app)
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
        index = null
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
        createFile(event, payload)
        break
      }
      case FileActions.Rename: {
        renameFile(event, payload)
        break
      }
      case FileActions.DeleteFiles: {
        deleteFiles(event, payload, fileWatcher)
        break
      }
      case FileActions.MoveFiles: {
        moveFiles(event, payload)
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
  ipcMain.handle(HandlerAction.GetFileData, async (_event, action: ReadFileContent) => {
    const { filePath, encoding } = action
    const content = await getFileContent(filePath, encoding)
    return content
  })
  ipcMain.handle(HandlerAction.ChooseDirectory, async (_event, action: ChooseDirectory) => {
    const defaultPath = getDirName(action.filePath)
    const result = await getDirectoryPath(win, defaultPath)
    return result
  })

  ipcMain.handle(HandlerAction.GetThumbnail, async (_event, action: GetThumbnail) => {
    const { filePath, baseDir } = action

    try {
      const thumbnail = await getThumbnail(baseDir, filePath)
      return thumbnail
    } catch (err) {
      return 'default'
    }
  })
  ipcMain.handle(HandlerAction.GetRecentlyModified, (_event, _action: GetRecentlyModified) => {
    const recentlyModified = getRecentlyModifiedFiles(index)
    return recentlyModified
  })
  ipcMain.handle(HandlerAction.GetBookmarkedFiles, (_event, action: GetBookmarkedFiles) => {
    const bookmarkedFiles = getBookmarkedFiles(index, action.bookmarks)
    return bookmarkedFiles
  })
  ipcMain.handle(HandlerAction.GetAppVersion, (_event) => {
    return app.getVersion()
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

  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {}
    }
  })

  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  })
} catch (e) {
  console.log(e)
}
