import logger from 'electron-log'
import { autoUpdater } from 'electron-updater'

autoUpdater.logger = logger

export default async function updateApp(): Promise<void> {
  try {
    await autoUpdater.checkForUpdatesAndNotify()
  } catch (err) {
    // Ignore errors thrown because user is not connected to internet
    if (err.message !== 'net::ERR_INTERNET_DISCONNECTED') {
      throw err
    }
  }
}
