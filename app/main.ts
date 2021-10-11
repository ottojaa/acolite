import { app, BrowserWindow, ipcMain, IpcMessageEvent, Menu, screen, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { IpcMainEvent } from 'electron/main'
import { join } from 'path'

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

  // Reads the folder tree from the baseDir and returns a list of descendants and their paths
  ipcMain.on('read-directory', (event: IpcMainEvent, baseDir: string) => {
    try {
      const directoryPath = baseDir

      const isDirectory = (path) => fs.statSync(path).isDirectory()
      const getDirectories = (path) =>
        fs
          .readdirSync(path)
          .map((name) => join(path, name))
          .filter(isDirectory)

      const isFile = (path) => fs.statSync(path).isFile()
      const getFiles = (path) =>
        fs
          .readdirSync(path)
          .map((name) => join(path, name))
          .filter(isFile)

      const getFilesRecursively = (path) => {
        let dirs = getDirectories(path)
        let files = dirs.map((dir) => getFilesRecursively(dir)).reduce((a, b) => a.concat(b), [])
        return files.concat(getFiles(path))
      }

      const fileStruct = getFilesRecursively(directoryPath)
      event.sender.send('read-directory-success', fileStruct)
    } catch (err) {
      console.log(err)
      event.sender.send('read-directory-failure', err)
    }
  })

  ipcMain.on('make-directory', (event: IpcMainEvent, args: [string, string]) => {
    console.log('args: ', args)
    const [name, baseDir] = args
    const directoryPath = path.join(baseDir, name)
    console.log('dirPath:', directoryPath)
    fs.promises
      .mkdir(directoryPath, { recursive: true })
      .then(() => {
        event.sender.send('make-directory-success')
      })
      .catch((err) => {
        event.sender.send('make-directory-failure', err)
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
