import { FSWatcher, watch } from 'chokidar'
import { addToIndex, updateIndex } from '../ipc-events/store-events'
import { Document } from 'flexsearch'
import { Doc } from '../shared/interfaces'
import { writeThumbnailImage } from '../thumbnail-helpers/thumbnail-helpers'
import { Scheduler } from '../action-scheduler/scheduler'
import { BrowserWindow } from 'electron'
import { StoreResponses } from '../shared/actions'

export class FileWatcher {
  window: BrowserWindow
  index: Document<Doc, true>
  watcher: FSWatcher

  ignoredFolders = ['node_modules', '_thumbnails', '.DS_Store']
  baseDir: string
  indexQueue = new Scheduler()
  isScheduling$ = this.indexQueue.isScheduling()

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
    let initialResponseSent = false

    this.isScheduling$.subscribe((indexing) => {
      if (!initialResponseSent) {
        this.window.webContents.send(StoreResponses.IndexingReady)
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
        writeThumbnailImage(this.baseDir, path, 'create')
      })
      .on('change', (path: string) => {
        this.indexQueue.addToQueue(updateIndex(path, this.index))
        writeThumbnailImage(this.baseDir, path, 'update')
      })
      .on('ready', () => this.initScheduler())
  }

  removeAllExistingListeners(): void {
    try {
      this.watcher.close()
    } catch {}
  }
}
