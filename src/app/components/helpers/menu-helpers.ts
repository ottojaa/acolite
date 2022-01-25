import { FilePathContainer, TreeElement } from '../../../../app/shared/interfaces'
import { cloneDeep } from 'lodash'

export const expandNodeRecursive = (root: TreeElement, path: string) => {
  if (!path) {
    return
  }

  const rootPath = root.data.filePath
  const nodeParent = window.path.getDirName(path)
  const diff = nodeParent.replace(rootPath, '')

  const getPathsToExpand = () => {
    const paths = diff.split(window.path.getPathSeparator())
    let lastPath = rootPath

    const resultPaths = paths.map((nodePath) => {
      lastPath = window.path.getJoinedPath([lastPath, nodePath])
      return lastPath
    })
    return resultPaths.filter((el) => el !== rootPath)
  }

  const pathsToExpand = getPathsToExpand()

  const expandRecursive = (node: TreeElement) => {
    node.expanded = true
    if (node.children) {
      node.children.forEach((childNode) => {
        expandRecursive(childNode)
      })
    }
  }

  if (pathsToExpand.length) {
    root.children.forEach((child) => {
      if (pathsToExpand.includes(child.data.filePath)) {
        expandRecursive(child)
      }
    })
  }
}

export const getPathsToBeModified = (selectedFiles: TreeElement[], target?: TreeElement): FilePathContainer => {
  const folders = selectedFiles.filter((el) => el.type === 'folder')
  const files = selectedFiles.filter((el) => el.type === 'file')
  const dirPaths = folders.map((folder) => folder.data.filePath)
  const filteredDirPaths = filterDirPathsWithNoParentSelected(dirPaths, target)
  const filteredFilePaths = filePathsWithNoParentDirectorySelected(dirPaths, files, target)

  return { folders: filteredDirPaths, files: filteredFilePaths }
}

export const filePathsWithNoParentDirectorySelected = (
  dirPaths: string[],
  files: TreeElement[],
  target?: TreeElement
): string[] => {
  const fileHasNoParentInDirPaths = (file: TreeElement, paths: string[]) =>
    !paths.some((path) => file.data.filePath.includes(path))

  return files
    .filter((file) => fileHasNoParentInDirPaths(file, dirPaths) && targetIsNotCurrentParent(file.data.filePath, target))
    .map((el) => el.data.filePath)
}

export const filterDirPathsWithNoParentSelected = (dirPaths: string[], target?: TreeElement): string[] => {
  const getPathDepth = (path: string) => path.split(window.path.getPathSeparator()).length
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
  if (!target) {
    return Object.values(dirsGroupedByDepth).reduce((acc, curr) => acc.concat(curr), [])
  }

  return Object.values(dirsGroupedByDepth)
    .reduce((acc, curr) => acc.concat(curr), [])
    .filter((el) => targetIsNotCurrentParent(el, target))
}

export const pathContainerIsEmpty = (payload: FilePathContainer): boolean => {
  return payload['folders']?.length === 0 && payload['files']?.length === 0
}

const targetIsNotCurrentParent = (filePath: string, target: TreeElement) => {
  if (!target) {
    return true
  }

  return window.path.getDirName(filePath) !== target.data.filePath
}
