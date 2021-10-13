import { app, BrowserWindow, ipcMain, IpcMessageEvent, Menu, screen, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { IpcMainEvent } from 'electron/main'
import { join } from 'path'
import { FileEntity, getFileEntityFromPath } from './utils'

interface TreeElement {
  data: FileEntity
  children?: (TreeElement | FileEntity)[]
}

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

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400))

  /*  ipcMain.on('show-context-menu', (event) => {
    console.log('SHOW CONTEXTMENU')
    const template: any[] = [
      {
        label: 'Menu Item 1',
        click: () => {
          event.sender.send('context-menu-command', 'menu-item-1')
        },
      },
      { type: 'separator' },
      { label: 'Menu Item 2', type: 'checkbox', checked: true },
    ]
    const menu: any = Menu.buildFromTemplate(template)
    menu.popup(BrowserWindow.fromWebContents(event.sender))
  }) */

  /**
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * * * * * * * * * * * * *  START ipcMain-listeners  * * * * * * * * * * * * * *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   */

  ipcMain.on('choose-directory', (event: IpcMainEvent) => {
    dialog
      .showOpenDialog(win, {
        properties: ['openDirectory', 'createDirectory'],
      })
      .then((result) => {
        if (result.canceled) {
          event.reply('choose-directory-canceled')
        } else if (result.filePaths) {
          // Take the dirPath chosen by the user and write it in the appConfig.json to overwrite the base-url
          const filePathRef = { baseDir: result.filePaths[0] }
          writeToFile(defaultConfigFilePath, filePathRef)
            .then(() => {
              event.reply('choose-directory-success', result.filePaths[0])
            })
            .catch((err) => {
              throw err
            })
        }
      })
      .catch((err) => {
        event.reply('choose-directory-failure', err)
      })
  })

  ipcMain.on('set-default-directory', (event: IpcMainEvent) => {
    const filePathRef = { baseDir: __dirname }
    writeToFile(defaultConfigFilePath, filePathRef)
      .then(() => {
        event.sender.send('set-default-directory-success')
      })
      .catch((err) => {
        event.sender.send('set-default-directory-failure', err)
      })
  })

  // Reads the folder tree from the baseDir and returns a list of descendants and their information
  ipcMain.on('read-directory', (event: IpcMainEvent, baseDir: string) => {
    try {
      const directoryPath = baseDir

      const isDirectory = (path: string) => fs.statSync(path).isDirectory()
      const getDirectories = (fileEntity: FileEntity) =>
        fs
          .readdirSync(fileEntity.filePath)
          .map((name) => join(fileEntity.filePath, name))
          .filter(isDirectory)
          .map(getFileEntityFromPath)

      const isFile = (path: string) => fs.statSync(path).isFile()
      const getFiles = (fileEntity: FileEntity) =>
        fs
          .readdirSync(fileEntity.filePath)
          .map((name) => join(fileEntity.filePath, name))
          .filter(isFile)
          .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item)) // Filter hidden files such as .DS_Store
          .map(getFileEntityFromPath)

      const getFilesRecursively = (file: FileEntity): (TreeElement | FileEntity)[] => {
        let dirs = getDirectories(file)
        let files: (TreeElement | FileEntity)[] = dirs.map((dir) => {
          return {
            data: dir,
            children: getFilesRecursively(dir).reduce(
              (directoryDescendants: (TreeElement | FileEntity)[], descendant: TreeElement | FileEntity) =>
                directoryDescendants.concat(descendant),
              []
            ),
          }
        })
        return files.concat(getFiles(file))
      }

      const rootFolder = getFileEntityFromPath(directoryPath)
      const fileStruct = getFilesRecursively(rootFolder)

      console.log({ rootFolder, fileStruct })

      event.sender.send('read-directory-success', fileStruct)
    } catch (err) {
      console.log(err)
      event.sender.send('read-directory-failure', err)
    }
  })

  ipcMain.on('make-directory', (event: IpcMainEvent, args: [string, string]) => {
    const [name, baseDir] = args
    const directoryPath = path.join(baseDir, name)
    fs.promises
      .mkdir(directoryPath, { recursive: true })
      .then(() => {
        const newDir = getFileEntityFromPath(directoryPath)
        event.sender.send('make-directory-success', { data: newDir, children: [] })
      })
      .catch((err) => {
        event.sender.send('make-directory-failure', err)
      })
  })

  ipcMain.on('create-file', (event: IpcMainEvent, path: string) => {
    fs.writeFile(path, '', (err) => {
      if (err) {
        event.sender.send('create-file-failure', err)
      }
      const file = getFileEntityFromPath(path)
      event.sender.send('create-file-success', file)
    })
  })

  /**
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * * * * * * * * * * * * *  END ipcMain-listeners  * * * * * * * * * * * * * * *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   */

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

const writeToFile = <T extends {}>(filePath: string, args: T): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject()
      const config = JSON.stringify({ ...JSON.parse(data.toString()), ...args })

      fs.writeFile(filePath, config, (err) => {
        if (err) reject()
        resolve()
      })
    })
  })
}
