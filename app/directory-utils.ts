import { cloneDeep } from 'lodash'
import { FilePathContainer } from '../src/app/interfaces/File'
import { TreeElement } from '../src/app/interfaces/Menu'
import { getDirName, getPathSeparator } from '../src/app/utils/file-utils'

export const getPathsToBeMoved = (selectedFiles: TreeElement[], target: TreeElement): FilePathContainer => {
  const folders = selectedFiles.filter((el) => el.data.type === 'folder')
  const files = selectedFiles.filter((el) => el.data.type === 'file')
  const dirPaths = folders.map((folder) => folder.data.filePath)
  const filteredDirPaths = filterDirPathsWithNoParentSelected(dirPaths, target)
  const filteredFilePaths = filePathsWithNoParentDirectorySelected(dirPaths, files)

  return { folders: filteredDirPaths, files: filteredFilePaths }
}

export const filePathsWithNoParentDirectorySelected = (dirPaths: string[], files: TreeElement[]): string[] => {
  const fileHasNoParentInDirPaths = (file: TreeElement, paths: string[]) =>
    !paths.some((path) => file.data.filePath.includes(path))

  return files.filter((file) => fileHasNoParentInDirPaths(file, dirPaths)).map((el) => el.data.filePath)
}

export const filterDirPathsWithNoParentSelected = (dirPaths: string[], target: TreeElement): string[] => {
  const getPathDepth = (path: string) => path.split(getPathSeparator()).length
  const dirsGroupedByDepth = dirPaths.reduce((acc, curr) => {
    const currentDepth = getPathDepth(curr)
    const dirsAtDepth = acc[currentDepth] || []
    acc[currentDepth] = [...dirsAtDepth, curr]

    return acc
  }, <Record<number, string[]>>{})

  const groupCopy = cloneDeep(dirsGroupedByDepth)
  const depthsSorted = Object.keys(dirsGroupedByDepth)
    .sort()
    .map((el) => parseInt(el))

  for (let currentDepth of depthsSorted) {
    const currentDepthDirs = groupCopy[currentDepth]
    const lowerDepths = depthsSorted.filter((el) => el < currentDepth)

    for (let lowerDepth of lowerDepths) {
      const lowerDepthDirs = groupCopy[lowerDepth]
      const hasParentAtLowerDepth = lowerDepthDirs.filter((lower) =>
        currentDepthDirs.some((curr) => curr.includes(lower) && curr !== lower)
      )
      if (hasParentAtLowerDepth) {
        delete dirsGroupedByDepth[currentDepth]
      }
    }
  }

  const targetIsNotCurrentParent = (filePath: string, target: TreeElement) =>
    target.data.filePath !== getDirName(filePath)

  return Object.values(dirsGroupedByDepth)
    .reduce((acc, curr) => acc.concat(curr), [])
    .filter((el) => targetIsNotCurrentParent(el, target))
}

export const pathContainerIsEmpty = (payload: FilePathContainer): boolean => {
  return payload['folders']?.length === 0 && payload['files']?.length === 0
}
