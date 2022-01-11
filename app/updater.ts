import { BrowserWindow } from 'electron'
import logger from 'electron-log'
import { autoUpdater, ProgressInfo } from 'electron-updater'
import { AutoUpdateEvents } from './shared/actions'

autoUpdater.logger = logger

export default function updateApp(window: BrowserWindow): void {
  try {
    autoUpdater.checkForUpdatesAndNotify()

    autoUpdater.on(AutoUpdateEvents.CheckingForUpdates, () => {
      window.webContents.send(AutoUpdateEvents.CheckingForUpdates)
    })

    autoUpdater.on(AutoUpdateEvents.UpdateAvailable, () => {
      window.webContents.send(AutoUpdateEvents.UpdateAvailable)
    })

    autoUpdater.on(AutoUpdateEvents.UpdateNotAvailable, () => {
      window.webContents.send(AutoUpdateEvents.UpdateNotAvailable)
    })

    autoUpdater.on(AutoUpdateEvents.UpdateDownloaded, () => {
      window.webContents.send(AutoUpdateEvents.UpdateDownloaded)
    })

    autoUpdater.on(AutoUpdateEvents.DownloadProgress, (progressInfo: ProgressInfo) => {
      const { percent } = progressInfo
      console.log(progressInfo)
      window.webContents.send(AutoUpdateEvents.DownloadProgress, Math.round(percent))
    })
  } catch (err) {
    // Ignore errors thrown because user is not connected to internet
    if (err.message !== 'net::ERR_INTERNET_DISCONNECTED') {
      throw err
    }
  }
}

export function quitAndInstall(): void {
  autoUpdater.quitAndInstall()
}

const mockDownloadProgress = (window: BrowserWindow) => {
  let intervalId: NodeJS.Timer
  let progress = 0

  const sendAndUpdateProgress = () => {
    if (progress < 100) {
      progress++
      window.webContents.send(AutoUpdateEvents.DownloadProgress, progress++)
    } else if (progress === 100) {
      clearInterval(intervalId)
      window.webContents.send(AutoUpdateEvents.UpdateDownloaded)
    }
  }
  intervalId = setInterval(sendAndUpdateProgress, 100)
}
