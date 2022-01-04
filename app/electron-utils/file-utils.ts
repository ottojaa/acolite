import * as path from 'path'
import * as fs from 'fs'
import { promises as fsp } from 'fs'
import { binaryTypes, editorTypes } from '../shared/constants'
import { Doc } from '../shared/interfaces'

export const getDirName = (filePath: string) => path.dirname(filePath)
export const getExtension = (filePath: string) => path.extname(filePath)
export const getExtensionSplit = (filename: string) => {
  const ext = path.extname(filename || '').split('.')
  return ext[ext.length - 1]
}
export const getBaseName = (filePath: string) => path.basename(filePath)
export const getJoinedPath = (paths: string[]) => path.join(...paths)
export const getPathSeparator = () => path.sep
export const getEditorType = (extension: string) =>
  editorTypes.find((type) => type.acceptedTypes.includes(extension))?.editor || ''

export const getFileData = (filePath: string): Promise<Doc> => {
  const extension = getExtensionSplit(filePath)
  const encoding = binaryTypes.includes(extension) ? 'binary' : 'utf-8'

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, encoding, (err, textContent) => {
      if (err) {
        reject(err)
        return
      }
      const fileStats = fs.statSync(filePath)
      const editorType = getEditorType(extension)

      resolve({
        fileName: getBaseName(filePath),
        filePath,
        textContent,
        extension,
        editorType,
        size: fileStats.size,
        ino: fileStats.ino,
        modifiedAt: fileStats.mtime,
        createdAt: fileStats.birthtime,
      })
    })
  })
}

export const getImageDataBase64 = (filePath: string): Promise<any> => {
  return fsp.readFile(filePath, { encoding: 'base64' })
}

export const getFileDataSync = (filePath: string): Doc => {
  try {
    const extension = getExtensionSplit(filePath)
    const encoding = binaryTypes.includes(extension) ? 'binary' : 'utf-8'

    const fileStats = fs.statSync(filePath)
    const textContent = fs.readFileSync(filePath, encoding)
    const editorType = getEditorType(extension)

    return {
      fileName: getBaseName(filePath),
      filePath,
      textContent,
      extension,
      editorType,
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
