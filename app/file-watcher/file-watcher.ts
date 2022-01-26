import { FSWatcher, watch } from 'chokidar'
import { addToIndex, removeIndex, updateIndex } from '../ipc-events/store-events'
import { Document } from 'flexsearch'
import { Doc } from '../shared/interfaces'
import { deleteThumbnail, writeThumbnailImage } from '../thumbnail-helpers/thumbnail-helpers'
import { Scheduler } from '../action-scheduler/scheduler'
import { BrowserWindow } from 'electron'
import { StoreResponses } from '../shared/ipc-actions'

/**
 * This class handles chokidar events, creating and deleting file thumbnails, and updating file indexes
 */
export class FileWatcher {
  window: BrowserWindow
  index: Document<Doc, true>
  watcher: FSWatcher

  ignoredFolders = ['node_modules', '_thumbnails', '.DS_Store']
  baseDir: string
  indexQueue = new Scheduler()

  startWatcher(baseDir: string, window: BrowserWindow, index: Document<Doc, true>): void {
    this.baseDir = baseDir
    this.window = window
    this.index = index

    this.watcher = watch(this.baseDir, {
      ignored: (path: string) => this.ignoredFolders.some((folder) => path.includes(folder)),
    })

    this.initWatcherEvents()
  }

  initScheduler(): void {
    this.window.webContents.send(StoreResponses.IndexingReady, { indexingReady: false })
    let initialResponseSent = false

    this.indexQueue.isScheduling$.subscribe((indexing) => {
      if (!initialResponseSent) {
        this.window.webContents.send(StoreResponses.IndexingReady, { indexingReady: true })
        initialResponseSent = true
      } else {
        this.window.webContents.send(StoreResponses.Indexing, { indexing })
      }
    })
  }

  initWatcherEvents(): void {
    this.watcher
      .on('add', (path: string) => {
        this.indexQueue.addToQueue(addToIndex(path, this.index))
        writeThumbnailImage(this.baseDir, path, 'create').catch((_err) => null)
      })
      .on('change', (path: string) => {
        this.indexQueue.addToQueue(updateIndex(path, this.index))
        writeThumbnailImage(this.baseDir, path, 'update').catch((_err) => null)
      })
      .on('ready', () => this.initScheduler())
  }

  /**
   * Chokidar's unlink event does not contain the inode number of the deleted file, because the file does not exist anymore. We use inodes as thumbnail file names, hence we need to call onDeleteFile
   * separately from the event that deletes the file, passing the ino as parameter
   * @param ino inode number of the file
   */
  onDeleteFile(ino: number): void {
    this.indexQueue.addToQueue(removeIndex(ino, this.index))
    deleteThumbnail(this.baseDir, ino).catch((_err) => null)
  }

  removeAllExistingListeners(): void {
    try {
      this.watcher.close()
    } catch {}
  }
}
