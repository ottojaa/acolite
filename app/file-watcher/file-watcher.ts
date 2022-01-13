import { watch } from 'chokidar'
import { addToIndex, updateIndex } from '../ipc-events/store-events'
import { Document } from 'flexsearch'
import { Doc } from '../shared/interfaces'

export const startFileWatcher = (path: string, index: Document<Doc, true>) => {
  const watcher = watch(path, {
    ignored: /[\/\\]\./,
    persistent: true,
  })

  const onWatcherReady = () => {
    console.info('File watcher ready, watching path ', path)
  }

  // Declare the listeners of the watcher
  watcher
    .on('add', (path: string) => {
      console.log('File', path, 'has been added')
      addToIndex(path, index)
    })
    .on('addDir', (path) => {
      console.log('Directory', path, 'has been added')
    })
    .on('change', (path: string) => {
      console.log('File', path, 'has been changed')
      updateIndex(path, index)
    })
    .on('unlink', (path: string) => {
      console.log('File', path, 'has been removed')
    })
    .on('unlinkDir', (path: string) => {
      console.log('Directory', path, 'has been removed')
    })
    .on('error', (error: Error) => {
      console.log('Error happened', error)
    })
    .on('ready', onWatcherReady)
    .on('raw', (event: string, path: string, details) => {
      console.log('Raw event info:', event, path, details)
    })
}
