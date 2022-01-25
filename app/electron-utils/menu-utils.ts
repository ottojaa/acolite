import { TreeNode } from 'primeng/api'
import { TreeElement, FileEntity } from '../shared/interfaces'
import { getBaseName, getPathSeparator } from './file-utils'

export type UpdateStrategy = 'create' | 'rename' | 'delete' | 'copy'
export interface Config {
  oldPath?: string
  newPath?: string
  isFolder?: boolean
  baseDir?: string
}

export const getUpdatedMenuItemsRecursive = (
  menuItems: TreeElement[],
  updatedItems: TreeElement[],
  strategy: UpdateStrategy,
  config?: Config
): TreeElement[] => {
  for (let updatedItem of updatedItems) {
    for (let item of menuItems) {
      // Find the updated item's parent, and update it
      if (item.data.filePath === updatedItem.data.parentPath) {
        updateItemByStrategy(item, updatedItem, strategy, config)
      }
      if (item.children) {
        getUpdatedMenuItemsRecursive(item.children, updatedItems, strategy, config)
      }
    }
  }

  return menuItems
}

export const replaceTreeNodeRecursive = (treeElements: TreeElement[], nodeToReplace: TreeElement, baseDir: string) => {
  const { filePath, parentPath } = nodeToReplace.data
  const replace = (elements: TreeElement[]) => {
    for (let item of elements) {
      if (item.data.filePath === parentPath) {
        const nodeIndex = item?.children.findIndex((el) => el.data.filePath === filePath)
        if (nodeIndex > -1) {
          item.children[nodeIndex] = { ...nodeToReplace }
          addIndents(item.children, baseDir)
        }
      } else if (item.children?.length) {
        replace(item.children)
      }
    }
  }
  replace(treeElements)

  return treeElements
}

const updateItemByStrategy = (
  item: TreeElement,
  updatedItem: TreeElement,
  strategy: UpdateStrategy,
  config?: Config
) => {
  switch (strategy) {
    case 'create': {
      const isFolder = updatedItem.type === 'folder'

      // PrimeNG tree sorts folders to the top
      item.children = isFolder ? [updatedItem, ...item.children] : [...item.children, updatedItem]
      item.expanded = true
      addIndents(item.children, config.baseDir)

      break
    }
    case 'rename': {
      item = getUpdatedFilePathsRecursive(item, config.newPath, config.oldPath)
      break
    }
    case 'delete': {
      item.children = item.children.filter((el) => !el.data.filePath.includes(updatedItem.data.filePath))
      break
    }
    default: {
      break
    }
  }
}

/**
 *
 * @param elementsToAdd elements to be added to the tree structure
 * @param elementsToDelete elements to be removed from the tree structure (files that do not exist anymore)
 * @param menuItems a directory's children
 * @param config contains information about the user's folder configuration
 */
export const moveRecursive = (
  elementsToAdd: TreeElement[],
  elementsToDelete: TreeElement[],
  menuItems: TreeElement[],
  config?: Config
): void => {
  for (let menuItem of menuItems) {
    const toBeAdded = elementsToAdd.filter((el) => el.data.parentPath === menuItem.data.filePath)
    const toBeDeleted = elementsToDelete
      .filter((el) => el.data.parentPath === menuItem.data.filePath)
      .map((x) => x.data.filePath)

    if (toBeAdded.length || toBeDeleted.length) {
      if (toBeAdded.length) {
        menuItem.children = [...menuItem.children, ...toBeAdded].sort((a, _b) => (a.type === 'folder' ? -1 : 1))
        menuItem.expanded = true
        addIndents(menuItem.children, config.baseDir)
      }
      if (toBeDeleted.length) {
        menuItem.children = menuItem.children.filter((child) => !toBeDeleted.includes(child.data.filePath))
      }
    }
    if (menuItem.children?.length) {
      moveRecursive(elementsToAdd, elementsToDelete, menuItem.children, config)
    }
  }
}
export const calculateIndents = (filePath: string, baseDir: string) => {
  const pathDiff = filePath.replace(baseDir, '')
  const separators = pathDiff.split(getPathSeparator())

  return separators.length - 2 // Do not show indent for rootDir, nor the first menuItems
}

/**
 * Indents are used to clarify which of the tree-elements belong to which parent-folder
 */
export const addIndents = (items: TreeElement[], baseDir: string): void => {
  items.forEach((item) => {
    item.data.indents = calculateIndents(item.data.filePath, baseDir)
    if (item.children?.length) {
      addIndents(item.children, baseDir)
    }
  })
}

/**
 * Updates the menuitem and its (possible) descendants by replacing the old filePaths / parentPaths with the new one
 */
export const getUpdatedFilePathsRecursive = (item: TreeElement, newPath: string, oldPath: string): TreeElement => {
  item.data.filePath = item.data.filePath.replace(oldPath, newPath)
  item.data.parentPath = item.data.parentPath.replace(oldPath, newPath)

  if (item.data.filePath === newPath) {
    item.label = getBaseName(newPath)
  }

  if (!item.children) {
    return item
  }

  return {
    ...item,
    children: item.children.map((child) => getUpdatedFilePathsRecursive(child, newPath, oldPath)),
  }
}

// PrimeNG styleClasses get applied back on each rerender, so in order to do enter animations that don't happen on each rerender
// we have to remove the styleClass properties from the menuItems after the animation is done.
export const removeExistingStyleClasses = (menuItems: TreeElement[]) => {
  setTimeout(() => {
    menuItems.forEach((item) => {
      if (item.styleClass) {
        delete item.styleClass
      }
      if (item.children?.length) {
        removeExistingStyleClasses(item.children)
      }
    })
  }, 500)
}

export const addFileToBaseDir = (menuItems: TreeNode<FileEntity>[], newItem: FileEntity) => {
  return [...menuItems, newItem]
}
