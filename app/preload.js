const { contextBridge, ipcRenderer } = require('electron')
const {
  getBaseName,
  getPathSeparator,
  getExtension,
  getJoinedPath,
  getDirName,
} = require('./electron-utils/file-utils')

contextBridge.exposeInMainWorld('ipc', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data)
  },
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data)
  },
  on: (channel, listener) => {
    const subscription = (_event, ...args) => listener(...args)
    ipcRenderer.on(channel, subscription)
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
})

contextBridge.exposeInMainWorld('path', {
  getPathSeparator: () => getPathSeparator(),
  getBaseName: (filePath) => getBaseName(filePath),
  getExtension: (filePath) => getExtension(filePath),
  getJoinedPath: (filePaths) => getJoinedPath(filePaths),
  getDirName: (filePath) => getDirName(filePath),
})
