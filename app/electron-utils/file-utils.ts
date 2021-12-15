import * as path from 'path'
import * as fs from 'fs'
import { editorTypes } from '../shared/constants'
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
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, textContent) => {
      if (err) {
        reject(err)
        return
      }
      const fileStats = fs.statSync(filePath)
      const extension = getExtensionSplit(filePath)
      const editorType = getEditorType(extension)

      resolve({
        fileName: getBaseName(filePath),
        filePath,
        textContent,
        extension,
        editorType,
        ino: fileStats.ino,
        modifiedAt: fileStats.mtime,
        createdAt: fileStats.birthtime,
      })
    })
  })
}

export const getFileDataSync = (filePath: string): Doc => {
  try {
    const textContent = fs.readFileSync(filePath, 'utf-8')
    const fileStats = fs.statSync(filePath)
    const extension = getExtensionSplit(filePath)
    const editorType = getEditorType(extension)

    return {
      fileName: getBaseName(filePath),
      filePath,
      textContent,
      extension,
      editorType,
      ino: fileStats.ino,
      modifiedAt: fileStats.mtime,
      createdAt: fileStats.birthtime,
    }
  } catch (err) {
    console.error(`error reading ${filePath}`, err)
    return null
  }
}
