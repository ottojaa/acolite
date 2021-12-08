import { TreeNode } from 'primeng/api'
import { TreeElement, FileEntity, MenuItemTypes } from '../shared/interfaces'
import { getBaseName, getPathSeparator } from './file-utils'

export type UpdateStrategy = 'create' | 'rename' | 'delete'
export interface Config {
  oldPath?: string
  newPath?: string
  isFolder?: boolean
  baseDir?: string
}

export const folderStructureToMenuItems = (
  baseDir: string,
  folderStruct: (TreeElement | FileEntity)[]
): TreeNode<FileEntity>[] => folderStruct.map((descendant) => createMenuItemsRecursive(baseDir, descendant, null))

const createMenuItemsRecursive = (
  baseDir: string,
  element: TreeElement | FileEntity,
  parent: TreeElement
): TreeNode => {
  if (isFolder(element) && element.data.type === 'folder') {
    const { data, children } = element
    const treeNode: TreeElement = {
      label: getBaseName(data.filePath),
      type: MenuItemTypes.Folder,
      key: data.filePath,
      leaf: false,
      parent,
      expanded: true,
      children: children.map((child) => createMenuItemsRecursive(baseDir, child, element)),
      data,
    }
    treeNode.data.indents = calculateIndents(treeNode, baseDir)

    return treeNode
  } else if (isFile(element)) {
    const treeNode = getTreeNodeFromFileEntity(element)
    treeNode.data.indents = calculateIndents(treeNode, baseDir)
    treeNode.parent = parent

    return treeNode
  }
  throw new Error('createMenuItemsRecursive failed, invalid element')
}

export const getUpdatedMenuItemsRecursive = (
  menuItems: TreeElement[],
  updatedItems: FileEntity[],
  strategy: UpdateStrategy,
  config?: Config
): TreeElement[] => {
  for (let updatedItem of updatedItems) {
    for (let item of menuItems) {
      // Find the updated item's parent, and update it
      if (item.data.filePath === updatedItem.parentPath) {
        updateItemByStrategy(item, updatedItem, strategy, config)
      }
      if (item.children) {
        getUpdatedMenuItemsRecursive(item.children, updatedItems, strategy, config)
      }
    }
  }

  return menuItems
}

const updateItemByStrategy = (
  item: TreeElement,
  updatedItem: FileEntity,
  strategy: UpdateStrategy,
  config?: Config
) => {
  switch (strategy) {
    case 'create': {
      const isFolder = updatedItem.type === 'folder'
      const treeNode = getTreeNodeFromFileEntity(updatedItem, 'new-file')

      // PrimeNG tree sorts folders to the top
      item.children = isFolder ? [treeNode, ...item.children] : [...item.children, treeNode]
      item.expanded = true
      addIndents(item.children, config.baseDir)

      break
    }
    case 'rename': {
      item = getUpdatedFilePathsRecursive(item, config.newPath, config.oldPath)
      break
    }
    case 'delete': {
      item.children = item.children.filter((el) => !el.data.filePath.includes(updatedItem.filePath))
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
    const toBeAdded = elementsToAdd
      .filter((el) => el.data.parentPath === menuItem.data.filePath)
      .map((el) => ({ ...el, parent: menuItem }))

    const toBeDeleted = elementsToDelete
      .filter((el) => el.data.parentPath === menuItem.data.filePath)
      .map((x) => x.data.filePath)

    if (toBeAdded.length || toBeDeleted.length) {
      if (toBeAdded.length) {
        menuItem.children = [...menuItem.children, ...toBeAdded].sort((a, _b) => (a.data.type === 'folder' ? -1 : 1))
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
export const calculateIndents = (el: TreeElement, baseDir: string) => {
  const pathDiff = el.data.filePath.replace(baseDir, '')
  const separators = pathDiff.split(getPathSeparator())

  return separators.length - 2 // Do not show indent for rootDir, nor the first menuItems
}

/**
 * Indents are used to clarify which of the tree-elements belong to which parent-folder
 */
export const addIndents = (items: TreeElement[], baseDir: string): void => {
  items.forEach((item) => {
    item.data.indents = calculateIndents(item, baseDir)
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

export const getTreeNodeFromFileEntity = (data: FileEntity, styleClass?: string): TreeNode<FileEntity> => {
  if (data.type === 'folder') {
    return {
      data,
      label: getBaseName(data.filePath),
      leaf: false,
      key: data.filePath,
      type: MenuItemTypes.Folder,
      children: [],
      ...(styleClass && { styleClass }),
    }
  } else {
    return {
      label: getBaseName(data.filePath),
      type: MenuItemTypes.File,
      key: data.filePath,
      data,
      ...(styleClass && { styleClass }),
    }
  }
}

export const addFileToBaseDir = (menuItems: TreeNode<FileEntity>[], newItem: FileEntity) => {
  return [...menuItems, newItem]
}

const isFolder = (el: TreeElement | FileEntity): el is TreeElement => {
  return 'data' in el
}

const isFile = (el: TreeElement | FileEntity): el is FileEntity => {
  return !('data' in el)
}
