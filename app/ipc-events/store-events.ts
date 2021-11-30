import { SearchResult, Tab, TreeElement } from '../../src/app/interfaces/Menu'
import * as fs from 'fs'
import { IpcMainEvent } from 'electron'
import { isPlainObject, cloneDeep, isEqual, uniqBy } from 'lodash'
import { getBaseName, getExtensionSplit, getJoinedPath, getPathSeparator } from '../../src/app/utils/file-utils'
import { StoreResponses, SearchQuery, SearchResponses, UpdateStore } from '../actions'
import { getRootDirectory } from '../utils'
import { Document } from 'flexsearch'
import { Doc } from '../../src/app/interfaces/File'
import { allowedConfigKeys } from '../../src/app/entities/file/constants'
import { AppConfig, WorkspaceConfig } from '../electron-interfaces'
import {
  getDefaultConfigJSON,
  validateAppConfig,
  updateSelectedWorkspaceConfig,
} from '../config-helpers/config-helpers'

export const initAppState = (event: IpcMainEvent, configPath: string, index: Document<Doc, true>) => {
  try {
    const configExists = fs.existsSync(configPath)

    if (!configExists) {
      fs.writeFileSync(configPath, getDefaultConfigJSON())
      event.sender.send(StoreResponses.InitAppSuccess)
    } else {
      const configBuffer = fs.readFileSync(configPath)
      const config: AppConfig = JSON.parse(configBuffer.toString())

      if (!isPlainObject(config)) {
        fs.writeFileSync(configPath, getDefaultConfigJSON())
      }

      const configCopy = cloneDeep(config)
      const validatedConfig = validateAppConfig(config)

      if (!isEqual(configCopy, validatedConfig)) {
        const updatedConfigJSON = JSON.stringify(validatedConfig, null, 2)
        fs.writeFileSync(configPath, updatedConfigJSON)
      }

      const getWorkspaceData = () => {
        const baseDir = validatedConfig.selectedWorkspace
        if (!baseDir) {
          return {}
        }
        const selectedWorkspaceData = validatedConfig.workspaces.find((workspace) => workspace.baseDir === baseDir)

        const state = { ...selectedWorkspaceData, rootDirectory: getRootDirectory(baseDir) }
        addFilesToIndex(state.rootDirectory.children, index)

        return state
      }
      const workspaceData = getWorkspaceData()
      event.sender.send(StoreResponses.InitAppSuccess, workspaceData)
    }
  } catch (err) {
    console.log(err)
    event.sender.send(StoreResponses.InitAppFailure)
  }
}

// ****************** Document store index functionality *******************

export const searchFiles = async (event: IpcMainEvent, query: SearchQuery, index: Document<Doc, true>) => {
  const { searchOpts } = query
  const { content, baseDir } = searchOpts
  const searchResult = await index.searchAsync(content, { enrich: true })
  const mappedResult = searchResult.map((res) => res.result)
  const uniqueElements = uniqBy(
    mappedResult.reduce((acc: SearchResult[], curr: any) => acc.concat([...curr.map((el) => el.doc)]), []),
    'filePath'
  )

  const replacePath = (pathToReplace: string) => {
    return pathToReplace.replace(getJoinedPath([baseDir, getPathSeparator()]), '')
  }

  const mappedResults = uniqueElements.map((file) => {
    file.highlightContentText = getHighlightContentText(file.content, content)
    file.highlightTitleText = getHighlightText(file.fileName, content)
    file.highlightPathText = getHighlightText(replacePath(file.filePath), content)

    return file
  })

  event.sender.send(SearchResponses.QuerySuccess, mappedResults)
}

export const addFilesToIndex = (treeStruct: TreeElement[], index: Document<Doc, true>) => {
  const files = flattenTreeStructure(treeStruct)
  files.forEach((file) => {
    if (file.data.type === 'file') {
      addToIndex(file.data.filePath, index)
    }
  })
}

export const updateIndex = async (newPath: string, index: Document<Doc, true>) => {
  const indexFile = await createIndexFileFromPath(newPath)
  if (indexFile.isFolder) {
    return
  }

  const { ino } = indexFile
  await index.updateAsync(ino, indexFile)
}

export const addToIndex = async (filePath: string, index: Document<Doc, true>) => {
  const indexFile = await createIndexFileFromPath(filePath)
  if (indexFile.isFolder) {
    return
  }

  const { ino } = indexFile
  await index.addAsync(ino, indexFile)
}

export const updateIndexesRecursive = (filePaths: string[], index: Document<Doc, true>) => {
  const updateIndexes = (path: string) => {
    if (!fs.lstatSync(path).isDirectory()) {
      return
    }

    fs.readdirSync(path)
      .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
      .forEach((file) => {
        const subpath = getJoinedPath([path, file])
        if (fs.lstatSync(subpath).isDirectory()) {
          updateIndexes(subpath)
        } else {
          updateIndex(subpath, index)
        }
      })
  }
  filePaths.forEach((path) => updateIndexes(path))
}

export const removeIndexes = async (inodes: number[], index: Document<Doc, true>) => {
  for (let node of inodes) {
    await index.removeAsync(node)
  }
}

export const getEmptyIndex = (): Document<Doc, true> => {
  return new Document({
    tokenize: 'full',
    resolution: 1,
    optimize: true,
    document: {
      id: 'id',
      index: ['filePath', 'fileName', 'content', 'createdAt', 'modifiedAt', 'extension'],
      store: true,
    },
  })
}

export const removeAllIndexes = (index: Document<Doc, true>) => {}

const createIndexFileFromPath = (filePath: string): Promise<Doc> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (_err, data) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject()
        }
        const { ino, mtime, birthtime } = stats // Ino refers to the unique lnode - identifier of the file, which we can use as a unique id
        const extension = getExtensionSplit(filePath)
        const fileName = getBaseName(filePath)
        const isFolder = stats.isDirectory()
        const doc: Doc = {
          ino,
          filePath,
          isFolder,
          fileName,
          extension,
          content: data,
          modifiedAt: mtime,
          createdAt: birthtime,
        }
        resolve(doc)
      })
    })
  })
}

// ****************** END Document store index functionality *******************

export const flattenTreeStructure = (treeElement: TreeElement[], arr: TreeElement[] = []) => {
  treeElement.forEach((el) => {
    arr.push(el)
    if (el.children?.length) {
      flattenTreeStructure(el.children, arr)
    }
  })
  return arr
}

export const updateStore = (event: IpcMainEvent, updateData: UpdateStore, configPath: string) => {
  updateSelectedWorkspaceConfig(updateData, configPath).then(
    () => {
      event.sender.send(StoreResponses.UpdateStoreSuccess)
    },
    (err) => {
      console.error(err)
      event.sender.send(StoreResponses.UpdateStoreFailure)
    }
  )
}

/**
 * generates a highlight text that is shown alongside other file data. Attempts to truncate the text while keeping the highlighted part intact
 * @param textContent the file's text content
 * @param query search query
 */
const getHighlightContentText = (textContent: string, query: string): string => {
  if (!textContent) {
    return ''
  }
  const highlightText = textContent.replace(
    new RegExp(query, 'gi'),
    (match) => '<span class="highlightText">' + match + '</span>'
  )

  const length = highlightText.length
  if (length < 80) {
    return highlightText
  }

  const shorten = (str: string, maxLen: number, separator = ' ') => {
    if (str.length <= maxLen) return str
    return str.substr(0, str.lastIndexOf(separator, maxLen))
  }

  const highlightStartIndex = highlightText.indexOf('<span ')
  const highlightEndIndex = highlightText.indexOf('</span>') + 7 // length of '</span>'
  const highlightString = highlightText.substring(highlightStartIndex, highlightEndIndex)
  let prefix = highlightText.substring(0, highlightStartIndex - 1)
  let suffix = highlightText.substring(highlightEndIndex, highlightText.length)

  if (highlightStartIndex > 100) {
    prefix = '...' + shorten(prefix, 90)
  }
  return prefix + highlightString + suffix
}

const getHighlightText = (textContent: string, query: string) => {
  return textContent.replace(new RegExp(query, 'gi'), (match) => '<span class="highlightText">' + match + '</span>')
}
