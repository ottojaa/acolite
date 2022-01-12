import * as path from 'path'
import * as fs from 'fs'
import { promises as fsp } from 'fs'
import { editorConfigs, indexFileTypes } from '../shared/constants'
import { Doc, Encoding } from '../shared/interfaces'

export const getDirName = (filePath: string) => path.dirname(filePath)
export const getExtension = (filePath: string) => path.extname(filePath)
export const getExtensionSplit = (filename: string) => {
  const ext = path.extname(filename || '').split('.')
  return ext[ext.length - 1]
}
export const getBaseName = (filePath: string) => path.basename(filePath)
export const getJoinedPath = (paths: string[]) => path.join(...paths)
export const getPathSeparator = () => path.sep
export const getEditorConfig = (extension: string) => {
  const match = editorConfigs.find((type) => type.acceptedTypes.includes(extension?.toLowerCase())) || {
    editorType: '',
    encoding: undefined,
  }
  const { editorType, encoding } = match
  return { editorType, encoding }
}

export const getFileData = (filePath: string): Promise<Doc> => {
  const extension = getExtensionSplit(filePath)

  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, fileStats) => {
      if (err) {
        reject(err)
        return
      }
      const editorConfig = getEditorConfig(extension)

      resolve({
        fileName: getBaseName(filePath),
        filePath,
        extension,
        editorConfig,
        size: fileStats.size,
        ino: fileStats.ino,
        modifiedAt: fileStats.mtime,
        createdAt: fileStats.birthtime,
      })
    })
  })
}

export const getFileDataToIndex = (filePath: string): Promise<Doc> => {
  const extension = getExtensionSplit(filePath)

  // If file type is not marked to be indexed, only index the meta data
  if (!indexFileTypes.includes(extension)) {
    return getFileData(filePath)
  }

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, fileContent) => {
      if (err) {
        reject(err)
        return
      }
      const fileStats = fs.statSync(filePath)
      const editorConfig = getEditorConfig(extension)

      resolve({
        fileName: getBaseName(filePath),
        filePath,
        fileContent,
        extension,
        editorConfig,
        size: fileStats.size,
        ino: fileStats.ino,
        modifiedAt: fileStats.mtime,
        createdAt: fileStats.birthtime,
      })
    })
  })
}

export const getFileContent = (filePath: string, encoding: Encoding) => {
  return fsp.readFile(filePath, { encoding })
}

export const getFileDataSync = (filePath: string): Doc => {
  try {
    const extension = getExtensionSplit(filePath)
    const fileStats = fs.statSync(filePath)
    const editorConfig = getEditorConfig(extension)

    return {
      fileName: getBaseName(filePath),
      filePath,
      extension,
      editorConfig,
      ino: fileStats.ino,
      size: fileStats.size,
      modifiedAt: fileStats.mtime,
      createdAt: fileStats.birthtime,
    }
  } catch (err) {
    console.error(`error reading ${filePath}, removing`, err)
    return null
  }
}

export const getNewPath = (currentPath: string, newParentPath: string) => {
  return getJoinedPath([currentPath.replace(currentPath, newParentPath), getBaseName(currentPath)])
}
