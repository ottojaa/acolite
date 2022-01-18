import * as fs from 'fs'
import { IpcMainEvent } from 'electron'
import { Document } from 'flexsearch'
import {
  getDefaultConfigJSON,
  validateAppConfig,
  updateSelectedWorkspaceConfig,
} from '../config-helpers/config-helpers'
import { formatDate } from '../date-and-time-helpers'
import {
  getFileData,
  getFileDataSync,
  getFileDataToIndex,
  getJoinedPath,
  getPathSeparator,
} from '../electron-utils/file-utils'
import { getRootDirectory } from '../electron-utils/utils'
import { AppConfig, SearchPreference, SearchResult, TreeElement, Doc } from '../shared/interfaces'
import { SearchQuery, UpdateStore, StoreResponses, SearchResponses } from '../shared/actions'
import { defaultSpliceLength } from '../shared/constants'
import { isPlainObject, cloneDeep, uniqBy, isEqual, reject } from 'lodash'

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
  const { fileContent, baseDir, searchPreferences } = searchOpts

  const replacePath = (pathToReplace: string) => {
    return pathToReplace.replace(getJoinedPath([baseDir, getPathSeparator()]), '')
  }

  const getSearchPayload = (searchPreferences: SearchPreference[]) => {
    const indexedFields = ['fileContent', 'filePath', 'fileName', 'extension']
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
  const searchResult = await index.searchAsync(fileContent, searchPayload)
  const mappedResult = searchResult.map((res) => res.result)
  const uniqueElements = uniqBy(
    mappedResult.reduce((acc: SearchResult[], curr: any) => acc.concat([...curr.map((el) => el.doc)]), []),
    'filePath'
  )
  const filteredResults = getFilteredResults(uniqueElements, searchPreferences)

  const defaultHighlights = {
    fileName: true,
    filePath: true,
    fileContent: true,
  }

  const shouldHighlight = searchPreferences.length
    ? searchPreferences.reduce((acc, curr) => {
        acc[curr.value] = curr.selected
        return acc
      }, defaultHighlights)
    : defaultHighlights

  const mappedResults = filteredResults.map((file) => {
    file.highlightContentText = shouldHighlight['fileContent']
      ? getHighlightContentText(file.fileContent, fileContent)
      : ''
    file.highlightTitleText = shouldHighlight['fileName'] ? getHighlightText(file.fileName, fileContent) : ''
    file.highlightPathText = shouldHighlight['filePath']
      ? getHighlightText(replacePath(file.filePath), fileContent)
      : ''

    return file
  })

  event.sender.send(SearchResponses.QuerySuccess, { searchResults: mappedResults })
}

export const getDashboardConfig = (
  index: Document<Doc, true> & { store?: Record<string, Doc> },
  bookmarks: string[] | undefined
): { bookmarkedFiles: Doc[]; recentlyModified: Doc[] } => {
  return {
    bookmarkedFiles: getBookmarkedFiles(index, bookmarks),
    recentlyModified: getRecentlyModifiedFiles(index),
  }
}

export const getBookmarkedFiles = (
  index: Document<Doc, true> & { store?: Record<string, Doc> },
  bookmarks: string[]
) => {
  const storeItems = Object.values(index.store)

  return storeItems
    .filter((item) => bookmarks?.includes(item.filePath))
    .sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1))
}

export const getRecentlyModifiedFiles = (index: Document<Doc, true> & { store?: Record<string, Doc> }) => {
  const storeItems = Object.values(index.store)
  return storeItems.sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1)).slice(0, defaultSpliceLength)
}

export const getUpdatedRecentlyModified = (recentlyModified: Doc[], updatedItemPath: string) => {
  const item = getFileDataSync(updatedItemPath)
  const filtered = recentlyModified.filter((el) => el.filePath !== updatedItemPath)
  return [item, ...filtered]
}

export const updateIndex = (filePath: string, index: Document<Doc, true>) => {
  return new Promise<void>((resolve) => {
    getFileDataToIndex(filePath)
      .then((indexFile) => {
        const { ino } = indexFile
        index.updateAsync(ino, indexFile, () => resolve())
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export const addToIndex = async (filePath: string, index: Document<any, true>) => {
  return new Promise<void>((resolve) => {
    getFileDataToIndex(filePath)
      .then((indexFile) => {
        const { ino } = indexFile
        index.addAsync(ino, indexFile, () => resolve())
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export const updateIndexesRecursive = async (filePaths: string[], index: Document<Doc, true>) => {
  const updateIndexes = async (path: string) => {
    if (!fs.lstatSync(path).isDirectory()) {
      await updateIndex(path, index)
      return
    }

    fs.readdirSync(path)
      .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
      .forEach(async (file) => {
        const subpath = getJoinedPath([path, file])
        if (fs.lstatSync(subpath).isDirectory()) {
          updateIndexes(subpath)
        } else {
          await updateIndex(subpath, index)
        }
      })
  }
  await Promise.all(filePaths.map(async (path) => await updateIndexes(path)))
}

export const removeIndex = async (inode: number, index: Document<Doc, true>) => {
  await index.removeAsync(inode)
}

export const getEmptyIndex = (): Document<Doc, true> => {
  return new Document({
    tokenize: 'forward',
    resolution: 1,
    context: false,
    optimize: true,
    document: {
      id: 'id',
      index: ['filePath', 'fileName', 'fileContent', 'createdAt', 'modifiedAt', 'extension'],
      store: true,
    },
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
 * @param fileContent the file's text content
 * @param query search query
 */
const getHighlightContentText = (fileContent: string, query: string): string => {
  if (!fileContent) {
    return ''
  }
  const highlightText = fileContent.replace(
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

const getHighlightText = (fileContent: string, query: string) => {
  return fileContent.replace(new RegExp(query, 'gi'), (match) => '<span class="highlightText">' + match + '</span>')
}
