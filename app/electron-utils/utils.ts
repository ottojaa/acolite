import * as path from 'path'
import * as fs from 'fs'
import { calculateIndents } from './menu-utils'
import { getBaseName, getDirName, getPathSeparator } from './file-utils'
import { MenuItemTypes, SelectedTab, State, TreeElement } from '../shared/interfaces'
import { join } from 'path'
import { ValidatorFn, AbstractControl } from '@angular/forms'

export const getTreeElementFromPath = (baseDir: string, filePath: string, isFolder: boolean): TreeElement => {
  const getExtension = (filename: string) => {
    const ext = path.extname(filename || '').split('.')
    return ext[ext.length - 1]
  }
  const type = isFolder ? MenuItemTypes.Folder : MenuItemTypes.File
  const fileExtension = isFolder ? null : getExtension(filePath)
  const label = getBaseName(filePath)
  const parentPath = getDirName(filePath)
  const indents = calculateIndents(filePath, baseDir)

  return {
    type,
    label,
    key: filePath,
    leaf: !isFolder,
    data: {
      filePath,
      parentPath,
      indents,
      ...(!isFolder && { fileExtension }),
    },
    ...(isFolder && { children: [] }),
  }
}

/**
 * Since the file entity does not exist after deletion, we need to mock it
 */
export const getDeletedFileMock = (filePath: string): TreeElement => {
  return {
    data: {
      filePath,
      parentPath: getDirName(filePath),
    },
  }
}

export const getTreeStructureFromBaseDirectory = (baseDir: string) => {
  const directoryPath = baseDir

  const filterFn = (dirent: fs.Dirent, type: 'file' | 'directory') =>
    type === 'file'
      ? dirent.isFile() && !/(^|\/)\.[^\/\.]/g.test(dirent.name)
      : dirent.isDirectory() && !dirent.name.includes('_thumbnails')

  const getEntities = async (fileEntity: TreeElement, type: 'file' | 'directory') => {
    const dirents = await fs.promises.readdir(fileEntity.data.filePath, { withFileTypes: true })

    return dirents.reduce((acc: TreeElement[], curr: fs.Dirent) => {
      const isValid = filterFn(curr, type)

      if (isValid) {
        const filePath = join(fileEntity.data.filePath, curr.name)
        const treeElement = getTreeElementFromPath(baseDir, filePath, curr.isDirectory())
        acc.push(treeElement)
      }
      return acc
    }, [])
  }

  const getFilesRecursively = async (file: TreeElement): Promise<TreeElement[]> => {
    const dirs = await getEntities(file, 'directory')

    const mapChildrenToDirectory = async (): Promise<TreeElement[]> =>
      await Promise.all(
        dirs.map(async (dir) => {
          const dirFiles = await getFilesRecursively(dir)
          return {
            ...dir,
            children: dirFiles.reduce(
              (directoryDescendants: TreeElement[], descendant: TreeElement) => directoryDescendants.concat(descendant),
              []
            ),
          }
        })
      )

    let files = await mapChildrenToDirectory()
    return files.concat(await getEntities(file, 'file'))
  }

  const rootFolder = getTreeElementFromPath(baseDir, directoryPath, true)
  return getFilesRecursively(rootFolder)
}

export const patchCollectionBy = <T, K extends keyof T>(collection: T[], newEl: T, key: K) => {
  const copy = collection.slice(0)
  const index = copy.findIndex((el) => el[key] === newEl[key])

  if (index > -1) {
    copy[index] = newEl
  } else {
    console.error(`no element with identifier ${key} === ${newEl[key]} found in collection`)
  }

  return copy
}

export const getRootDirectory = async (baseDir: string): Promise<TreeElement> => {
  const rootTreeElement = getTreeElementFromPath(baseDir, baseDir, true)
  const menuItems = await getTreeStructureFromBaseDirectory(baseDir)

  return { ...rootTreeElement, children: menuItems }
}

export const isBannedValue = (bannedValues: string[]): ValidatorFn => {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (bannedValues.indexOf(c.value) !== -1) {
      return { forbiddenValues: true }
    }
    return null
  }
}
