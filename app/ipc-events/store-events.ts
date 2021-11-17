import { AppConfig, SearchResult, Tab, TreeElement } from '../../src/app/interfaces/Menu'
import * as fs from 'fs'
import { IpcMainEvent } from 'electron'
import { isPlainObject, cloneDeep, isEqual, uniqBy } from 'lodash'
import { getBaseName, getExtensionSplit, getJoinedPath, getPathSeparator } from '../../src/app/utils/file-utils'
import { StoreResponses, SearchQuery, SearchResponses, UpdateStore } from '../actions'
import { getRootDirectory } from '../utils'
import { Document } from 'flexsearch'
import { Doc } from '../../src/app/interfaces/File'
import { allowedConfigKeys } from '../../src/app/entities/file/constants'

export const initAppState = (event: IpcMainEvent, configPath: string, index: Document<Doc, true>) => {
  try {
    const defaultConfig = JSON.stringify({ baseDir: '' }, null, 2)
    const configExists = fs.existsSync(configPath)

    if (!configExists) {
      fs.writeFileSync(configPath, defaultConfig)
      event.sender.send(StoreResponses.InitAppSuccess)
    } else {
      const configBuffer = fs.readFileSync(configPath)
      const config: AppConfig = JSON.parse(configBuffer.toString())

      if (!isPlainObject(config)) {
        fs.writeFileSync(configPath, defaultConfig)
      }

      const configCopy = cloneDeep(config)
      const updatedConfig = validateAndUpdateConfig(config)

      if (!isEqual(configCopy, updatedConfig)) {
        const updatedConfigJSON = JSON.stringify(updatedConfig, null, 2)
        fs.writeFileSync(configPath, updatedConfigJSON)
      }

      const getPayload = () => {
        const baseDir = updatedConfig.baseDir
        if (!baseDir) {
          return {}
        }

        const state = { ...updatedConfig, rootDirectory: getRootDirectory(baseDir) }
        addFilesToIndex(state.rootDirectory.children, index)

        return state
      }
      event.sender.send(StoreResponses.InitAppSuccess, getPayload())
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
  const { ino } = indexFile

  await index.updateAsync(ino, indexFile)
}

export const addToIndex = async (filePath: string, index: Document<Doc, true>) => {
  const indexFile = await createIndexFileFromPath(filePath)

  const { ino } = indexFile
  await index.addAsync(ino, indexFile)
}

export const removeIndexes = async (inodes: number[], index: Document<Doc, true>) => {
  for (let node of inodes) {
    await index.removeAsync(node)
  }
}

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
        const doc = {
          ino,
          filePath,
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
  try {
    fs.readFile(configPath, (_err, data) => {
      const storeData = JSON.parse(data.toString())
      const updatedStoreData = JSON.stringify({ ...storeData, ...updateData }, null, 2)
      fs.writeFile(configPath, updatedStoreData, (err) => {
        event.sender.send(StoreResponses.UpdateStoreSuccess)
      })
    })
  } catch (err) {
    event.sender.send(StoreResponses.UpdateStoreFailure)
  }
}

const validateAndUpdateConfig = (config: AppConfig): AppConfig => {
  const validatedConfigVal = <K extends keyof AppConfig>(key: K) => {
    switch (key) {
      case 'tabs': {
        const getTabData = (path: string) => {
          if (!fs.existsSync(path)) {
            return null
          }
          const content = fs.readFileSync(path, 'utf-8')
          const fileStats = fs.statSync(path)
          return <Tab>{
            fileName: getBaseName(path),
            extension: getExtensionSplit(path),
            path: path,
            textContent: content,
            data: {
              lastUpdated: fileStats.mtime,
            },
          }
        }
        return config.tabs.map((tab) => getTabData(tab.path)).filter((tab) => !!tab)
      }
      case 'baseDir': {
        const { baseDir } = config
        if (typeof baseDir === 'string' && fs.existsSync(baseDir)) {
          return baseDir
        }
        return ''
      }
      case 'sideMenuWidth': {
        const defaultWidth = 20

        const { sideMenuWidth } = config
        if (typeof sideMenuWidth === 'number') {
          const isValidWidth = Number.isInteger(sideMenuWidth) && sideMenuWidth >= 0 && sideMenuWidth <= 100
          return isValidWidth ? sideMenuWidth : defaultWidth
        }
        return defaultWidth
      }
      case 'editorTheme': {
        if (
          (typeof config.editorTheme === 'string' && config.editorTheme === 'dark') ||
          config.editorTheme === 'light'
        ) {
          return config.editorTheme
        }
        return 'dark'
      }
      default: {
        break
      }
    }
  }
  const allowedKeys = allowedConfigKeys
  const keys = Object.keys(config).filter((key) => allowedKeys.includes(key)) as (keyof AppConfig)[]

  return keys.reduce((acc, curr) => {
    acc[curr] = validatedConfigVal(curr)
    return acc
  }, {})
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
