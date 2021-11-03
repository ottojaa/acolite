import { cloneDeep } from 'lodash'
import { TreeNode } from 'primeng/api'
import { FileEntity, MenuItemTypes, TreeElement } from '../interfaces/Menu'
import { getBaseName, getDirName } from './file-utils'

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
): TreeNode<FileEntity>[] => folderStruct.map((descendant) => createMenuItemsRecursive(baseDir, descendant))

const createMenuItemsRecursive = (baseDir: string, element: TreeElement | FileEntity): TreeNode => {
  if (isFolder(element) && element.data.type === 'folder') {
    const { data, children } = element
    return {
      label: getBaseName(data.filePath),
      type: MenuItemTypes.Folder,
      leaf: false,
      children: children.map((child) => createMenuItemsRecursive(baseDir, child)),
      data,
    }
  } else if (isFile(element)) {
    return getTreeNodeFromFileEntity(element)
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
    // The workspace root directory is not included in the menuItems, so we have to handle the special case where we need to
    // update the top-level menuItem instead of its children (e.g deleting a top level directory)
    const isRootFolderMatch = updatedItem.parentPath === config?.baseDir
    if (isRootFolderMatch) {
      switch (strategy) {
        case 'delete': {
          menuItems = menuItems.filter((item) => item.data.filePath !== updatedItem.filePath)
          break
        }
        case 'create': {
          const treeNode = getTreeNodeFromFileEntity(updatedItem, 'new-file')

          menuItems.push(treeNode)
          break
        }
        default: {
          continue
        }
      }
    }
    for (let item of menuItems) {
      // Find the updated item's parent, and update it
      if (item.data.filePath === updatedItem.parentPath) {
        updateItemByStrategy(item, updatedItem, strategy, config)
      }
      if (!item.children?.length) {
        break
      }
      getUpdatedMenuItemsRecursive(item.children, updatedItems, strategy, config)
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

export const moveRecursive = (
  elementsToAdd: TreeElement[],
  elementsToDelete: TreeElement[],
  menuItems: TreeElement[]
): void => {
  for (let menuItem of menuItems) {
    const toBeAdded = elementsToAdd.filter((el) => el.data.parentPath === menuItem.data.filePath)
    const toBeDeleted = elementsToDelete
      .filter((el) => el.data.parentPath === menuItem.data.filePath)
      .map((x) => x.data.filePath)

    if (toBeAdded.length || toBeDeleted.length) {
      if (toBeAdded.length) {
        menuItem.children = [...menuItem.children, ...toBeAdded].sort((a, _b) => (a.data.type === 'folder' ? -1 : 1))
        menuItem.expanded = true
      }
      if (toBeDeleted.length) {
        menuItem.children = menuItem.children.filter((child) => !toBeDeleted.includes(child.data.filePath))
      }
    }
    if (menuItem.children?.length) {
      moveRecursive(elementsToAdd, elementsToDelete, menuItem.children)
    }
  }
}

/* export const deleteRecursive = (elementsToDelete: TreeElement[], menuItems: TreeElement[]) => {
  for (let menuItem of menuItems) {
    const items = elementsToDelete
      .filter((el) => el.data.parentPath === menuItem.data.filePath)
      .map((x) => x.data.filePath)

    if (items?.length) {
      menuItem.children = menuItem.children.filter((child) => !items.includes(child.data.filePath))
      break
    }
    if (menuItem.children?.length) {
      deleteRecursive(elementsToDelete, menuItem.children)
    }
  }
  return menuItems
} */

/**
 * Updates the menuitem and its (possible) descendants by replacing the old filePaths / parentPaths with the new one
 */
export const getUpdatedFilePathsRecursive = (item: TreeElement, newPath: string, oldPath: string): TreeElement => {
  const itemCopy = { ...item.data }
  console.log('ITEMCOPY path', itemCopy)
  item.data.filePath = item.data.filePath.replace(oldPath, newPath)
  item.data.parentPath = item.data.parentPath.replace(oldPath, newPath)
  console.log('UPDATED FILEPATH', item.data)

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

export const removeExistingStyleClasses = (menuItems: TreeElement[]) => {
  menuItems.forEach((item) => {
    if (item.styleClass) {
      delete item.styleClass
    }
    if (item.children?.length) {
      removeExistingStyleClasses(item.children)
    }
  })
}

export const getTreeNodeFromFileEntity = (data: FileEntity, styleClass?: string): TreeNode<FileEntity> => {
  if (data.type === 'folder') {
    return {
      data,
      label: getBaseName(data.filePath),
      leaf: false,
      type: MenuItemTypes.Folder,
      children: [],
      ...(styleClass && { styleClass }),
    }
  } else {
    return {
      label: getBaseName(data.filePath),
      type: MenuItemTypes.File,
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
