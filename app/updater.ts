import { App, BrowserWindow, IpcMain } from 'electron'
import logger from 'electron-log'
import { autoUpdater, ProgressInfo } from 'electron-updater'
import { AutoUpdateEvent } from './shared/ipc-actions'

autoUpdater.logger = logger
autoUpdater.autoDownload = false

export function checkForUpdates(window: BrowserWindow): void {
  try {
    autoUpdater.checkForUpdatesAndNotify()
    autoUpdater.removeAllListeners()

    startAutoUpdaterEventListeners(window)
  } catch (err) {
    // Ignore errors thrown because user is not connected to internet
    if (err.message !== 'net::ERR_INTERNET_DISCONNECTED') {
      logger.info('an error prevented the update from proceeding: ', err.message)
      throw err
    }
  }
}

const startAutoUpdaterEventListeners = (window: BrowserWindow) => {
  const sendContentsToWindow = (autoUpdateEvent: AutoUpdateEvent, content?: any) => {
    window.webContents.send(autoUpdateEvent, content)
  }

  autoUpdater.on(AutoUpdateEvent.CheckingForUpdates, () => {
    sendContentsToWindow(AutoUpdateEvent.CheckingForUpdates)
  })

  autoUpdater.on(AutoUpdateEvent.UpdateAvailable, () => {
    sendContentsToWindow(AutoUpdateEvent.UpdateAvailable)
  })

  autoUpdater.on(AutoUpdateEvent.UpdateNotAvailable, () => {
    sendContentsToWindow(AutoUpdateEvent.UpdateNotAvailable)
  })

  autoUpdater.on(AutoUpdateEvent.UpdateDownloaded, () => {
    sendContentsToWindow(AutoUpdateEvent.UpdateDownloaded)
  })

  autoUpdater.on(AutoUpdateEvent.DownloadProgress, (progressInfo: ProgressInfo) => {
    const { percent, transferred, total } = progressInfo
    const progressObj = { percent: Math.round(percent), progress: { transferred, total } }
    logger.info(`progressInfo.percent: ${percent}`)

    sendContentsToWindow(AutoUpdateEvent.DownloadProgress, progressObj)
  })
}

export const downloadUpdate = () => {
  autoUpdater.downloadUpdate()
}

export const quitAndInstall = (app: App) => {
  setImmediate(() => {
    app.removeAllListeners('window-all-closed')
    autoUpdater.quitAndInstall()
  })
}
