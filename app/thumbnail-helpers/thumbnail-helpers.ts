import { nativeImage, Size } from 'electron'
import * as fs from 'fs'
import { getJoinedPath } from '../electron-utils/file-utils'

const thumbnailSize: Size = {
  width: 1000,
  height: 680,
}

export const writeThumbnailImage = (baseDir: string, filePath: string, operation: 'create' | 'update' = 'update') => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const thumbnailPath = await getThumbnailPath(baseDir, filePath)

      if (operation === 'create' && fs.existsSync(thumbnailPath)) {
        resolve()
      }

      nativeImage
        .createThumbnailFromPath(filePath, thumbnailSize)
        .then((thumbnail) => {
          const thumbnailUrl = thumbnail.toDataURL()
          fs.writeFile(thumbnailPath, thumbnailUrl, () => resolve())
        })
        .catch((err) => {
          console.error(`Unable to create thumbnail for file ${filePath}`, err)
          reject(err)
        })
    } catch (err) {
      console.error(`Unable to create thumbnail for file ${filePath}`, err)
      reject(err)
    }
  })
}

export const deleteThumbnail = (baseDir: string, inode: number) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const thumbnailBaseDir = getJoinedPath([baseDir, '_thumbnails'])
      const filePath = getJoinedPath([thumbnailBaseDir, inode.toString()])
      fs.rm(filePath, (err) => {
        if (err) {
          reject()
        }
        resolve()
        console.log(`Deleted thumbnail ${inode}`)
      })
    } catch (err) {
      console.error('Error occurred while deleting', err)
      reject(err)
    }
  })
}

export const getThumbnail = async (baseDir: string, filePath: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const thumbnailPath = await getThumbnailPath(baseDir, filePath)
      if (!fs.existsSync(thumbnailPath)) {
        resolve('default')
        return
      }

      fs.readFile(thumbnailPath, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error occurred while getting thumbnail', err)
          reject(err)
        }
        resolve(data)
      })
    } catch (err) {
      console.error('Error occurred while getting thumbnail', err)
      reject(err)
    }
  })
}

const getThumbnailPath = async (baseDir: string, filePath: string, inode?: number) => {
  const dirPath = getJoinedPath([baseDir, '_thumbnails'])

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }

  const ino = inode ? inode : (await fs.promises.stat(filePath)).ino
  return getJoinedPath([dirPath, `${ino}`])
}
