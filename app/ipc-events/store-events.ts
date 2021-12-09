import * as fs from 'fs'
import { IpcMainEvent } from 'electron'
import { isPlainObject, cloneDeep, isEqual, uniqBy } from 'lodash'
import { Document } from 'flexsearch'
import {
  getDefaultConfigJSON,
  validateAppConfig,
  updateSelectedWorkspaceConfig,
} from '../config-helpers/config-helpers'
import { formatDate } from '../date-and-time-helpers'
import { getBaseName, getExtensionSplit, getJoinedPath, getPathSeparator } from '../electron-utils/file-utils'
import { getRootDirectory } from '../electron-utils/utils'
import { AppConfig, SearchPreference, SearchResult, FileEntity, TreeElement, Doc, State } from '../shared/interfaces'
import { SearchQuery, UpdateBookmarkedFiles, UpdateStore, StoreResponses, SearchResponses } from '../shared/actions'
import { defaultSpliceLength } from '../shared/constants'

export const initAppState = async (event: IpcMainEvent, configPath: string, index: Document<Doc, true>) => {
  try {
    const configExists = fs.existsSync(configPath)

    // No config file, proceed to initial setup
    if (!configExists) {
      fs.writeFileSync(configPath, getDefaultConfigJSON())
      event.sender.send(StoreResponses.InitAppSuccess, {})
    } else {
      const configBuffer = fs.readFileSync(configPath)
      const config: AppConfig = JSON.parse(configBuffer.toString())

      // Invalid JSON, overwrite. unnecessary because JSON.parse would fail anyway -> move the validity check to a separate validation func?
      if (!isPlainObject(config)) {
        fs.writeFileSync(configPath, getDefaultConfigJSON())
      }

      const configCopy = cloneDeep(config)
      const validatedConfig = validateAppConfig(config)

      // If validated config is different from the current one, there was something wrong in it and we should overwrite with the validated one
      if (!isEqual(configCopy, validatedConfig)) {
        const updatedConfigJSON = JSON.stringify(validatedConfig, null, 2)
        fs.writeFileSync(configPath, updatedConfigJSON)
      }

      // Searches the config json for a selected workspace, then appends state data with the persistent data from the config
      const getWorkspaceData = async () => {
        const baseDir = validatedConfig.selectedWorkspace
        if (!baseDir) {
          return {}
        }
        const selectedWorkspaceData = validatedConfig.workspaces.find((workspace) => workspace.baseDir === baseDir)
        const rootDirectory = getRootDirectory(baseDir)

        await addFilesToIndexSynchronous(rootDirectory.children, index)

        const dashboardConfig = getDashboardConfig(index, selectedWorkspaceData.bookmarks)
        const state = { ...selectedWorkspaceData, rootDirectory, ...dashboardConfig }
        return state
      }
      const workspaceData = await getWorkspaceData()
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
  const { content, baseDir, searchPreferences } = searchOpts

  const replacePath = (pathToReplace: string) => {
    return pathToReplace.replace(getJoinedPath([baseDir, getPathSeparator()]), '')
  }

  const getSearchPayload = (searchPreferences: SearchPreference[]) => {
    const indexedFields = ['content', 'filePath', 'fileName', 'extension']
    const selectedOptions = searchPreferences.filter((preference) => preference.selected)

    if (!selectedOptions.length) {
      return { enrich: true }
    }

    return selectedOptions.reduce(
      (acc: { index: string[]; enrich: boolean }, curr: SearchPreference) => {
        if (indexedFields.includes(curr.value)) {
          acc.index.push(curr.value)
        }
        return acc
      },
      { index: [], enrich: true }
    )
  }

  const getFilteredResults = (searchResults: SearchResult[], searchPreferences: SearchPreference[]) => {
    const resultFilters = ['createdAt', 'modifiedAt']
    const dateRangePreferences = searchPreferences.filter(
      (preference) => resultFilters.includes(preference.value) && preference.selected
    )

    if (!dateRangePreferences.length) {
      return searchResults
    }

    const isDateInsideRange = (date: Date, range: { start?: Date; end?: Date }) => {
      const { start, end } = range

      const formattedDate = formatDate(date)
      const formattedStart = formatDate(start)
      const formattedEnd = formatDate(end)

      if (!formattedStart && !end) {
        return true
      }
      if (formattedStart && end) {
        return formattedDate >= formattedStart && formattedDate <= formattedEnd
      }
      if (!formattedStart && end) {
        return formattedDate <= formattedEnd
      }
      if (formattedStart && !end) {
        return formattedDate >= formattedStart
      }

      return true
    }

    return searchResults.filter((result) => {
      return dateRangePreferences.some((preference) => {
        const checkIsInRange = () => {
          switch (preference.value) {
            case 'createdAt': {
              return isDateInsideRange(result.createdAt, preference.range)
            }
            case 'modifiedAt': {
              return isDateInsideRange(result.modifiedAt, preference.range)
            }
            default: {
              return true
            }
          }
        }

        return checkIsInRange()
      })
    })
  }

  const searchPayload = getSearchPayload(searchPreferences)
  const searchResult = await index.searchAsync(content, searchPayload)
  const mappedResult = searchResult.map((res) => res.result)
  const uniqueElements = uniqBy(
    mappedResult.reduce((acc: SearchResult[], curr: any) => acc.concat([...curr.map((el) => el.doc)]), []),
    'filePath'
  )
  const filteredResults = getFilteredResults(uniqueElements, searchPreferences)

  const defaultHighlights = {
    fileName: true,
    filePath: true,
    content: true,
  }

  const shouldHighlight = searchPreferences.length
    ? searchPreferences.reduce((acc, curr) => {
        acc[curr.value] = curr.selected
        return acc
      }, defaultHighlights)
    : defaultHighlights

  const mappedResults = filteredResults.map((file) => {
    file.highlightContentText = shouldHighlight['content'] ? getHighlightContentText(file.content, content) : ''
    file.highlightTitleText = shouldHighlight['fileName'] ? getHighlightText(file.fileName, content) : ''
    file.highlightPathText = shouldHighlight['filePath'] ? getHighlightText(replacePath(file.filePath), content) : ''

    return file
  })

  event.sender.send(SearchResponses.QuerySuccess, { searchResults: mappedResults })
}

export const getDashboardConfig = (
  index: Document<Doc, true> & { store?: Record<string, Doc> },
  bookmarks: string[] | undefined
): { bookmarkedFiles: Doc[]; recentlyModified: Doc[] } => {
  const storeItems = Object.values(index.store)
  const getBookmarks = () => {
    return storeItems
      .filter((item) => bookmarks?.includes(item.filePath))
      .sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1))
      .slice(0, 50)
  }

  const getRecentlyModified = () => {
    return storeItems.sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1)).slice(0, defaultSpliceLength)
  }

  return {
    bookmarkedFiles: getBookmarks(),
    recentlyModified: getRecentlyModified(),
  }
}

export const getUpdatedRecentlyModified = (recentlyModified: Doc[], updatedItemPath: string) => {
  const item = createIndexFileFromPathSync(updatedItemPath)
  const filtered = recentlyModified.filter((el) => el.filePath !== updatedItemPath)
  return [item, ...filtered]
}

export const updateBookmarkedFiles = (event: IpcMainEvent, payload: UpdateBookmarkedFiles): void => {
  const { bookmarkPath, bookmarkedFiles } = payload
  const shouldFilter = bookmarkedFiles?.some((file) => file.filePath === bookmarkPath)

  const getBookmarkData = (): Doc => {
    const content = fs.readFileSync(bookmarkPath, 'utf-8')
    const fileStats = fs.statSync(bookmarkPath)

    return {
      ino: fileStats.ino,
      fileName: getBaseName(bookmarkPath),
      extension: getExtensionSplit(bookmarkPath),
      filePath: bookmarkPath,
      content: content,
      createdAt: fileStats.birthtime,
      modifiedAt: fileStats.mtime,
    }
  }
  const updatedBookmarks: Doc[] = shouldFilter
    ? bookmarkedFiles.filter((file) => file.filePath !== bookmarkPath)
    : [...bookmarkedFiles, getBookmarkData()]

  event.sender.send(StoreResponses.UpdateBookmarkedFilesSuccess, { bookmarkedFiles: updatedBookmarks })
}

export const addFilesToIndex = (treeStruct: TreeElement[], index: Document<Doc, true>) => {
  const files = flattenTreeStructure(treeStruct)
  files.forEach((file) => {
    if (file.data.type === 'file') {
      addToIndex(file.data.filePath, index)
    }
  })
}

export const addFilesToIndexSynchronous = (treeStruct: TreeElement[], index: Document<Doc, true>): Promise<string> => {
  return new Promise(async (resolve, _reject) => {
    const files = flattenTreeStructure(treeStruct)
    for (const file of files) {
      if (file.data.type === 'file') {
        await addToIndex(file.data.filePath, index)
      }
    }
    resolve('success')
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

export const updateIndexesRecursive = (filePaths: string[], index: Document<Doc, true>) => {
  const updateIndexes = (path: string) => {
    if (!fs.lstatSync(path).isDirectory()) {
      updateIndex(path, index)
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

const createIndexFileFromPath = (filePath: string): Promise<Doc> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) reject(err)

      fs.stat(filePath, (err, stats) => {
        if (err) reject()

        const { ino, mtime, birthtime } = stats // Ino refers to the unique lnode - identifier of the file, which we can use as a unique id
        const extension = getExtensionSplit(filePath)
        const fileName = getBaseName(filePath)
        const doc: Doc = {
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

const createIndexFileFromPathSync = (filePath: string): Doc => {
  const content = fs.readFileSync(filePath, 'utf-8')
  const fileStats = fs.statSync(filePath)
  const { ino, mtime, birthtime } = fileStats
  const extension = getExtensionSplit(filePath)
  const fileName = getBaseName(filePath)

  return {
    ino,
    filePath,
    fileName,
    extension,
    content: content,
    modifiedAt: mtime,
    createdAt: birthtime,
  }
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
  const { state } = updateData
  updateSelectedWorkspaceConfig(state, configPath).then(
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
