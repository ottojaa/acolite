import { cloneDeep } from 'lodash'
import { TreeNode } from 'primeng/api'
import { FileEntity, MenuItemTypes, TreeElement } from '../interfaces/Menu'
import { getBaseName } from './file-utils'

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
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      children: children.map((child) => createMenuItemsRecursive(baseDir, child)),
      data,
    }
  } else if (isFile(element)) {
    return getTreeNodeFromFile(element)
  }
  throw new Error('createMenuItemsRecursive failed, invalid element')
}

export const getUpdatedMenuItemsRecursive = (
  menuItems: TreeElement[],
  updatedItems: FileEntity[],
  strategy: UpdateStrategy,
  config?: Config
): TreeElement[] => {
  console.log(updatedItems)
  const menuCopy = cloneDeep(menuItems)
  const updatedItemsCopy = cloneDeep(updatedItems)
  for (let updatedItem of updatedItemsCopy) {
    for (let item of menuCopy) {
      // Find the updated item's parent, and update it

      console.log('item.filePath', item.data.filePath)
      console.log('parentPath', updatedItem.parentPath)
      if (item.data.filePath === updatedItem.parentPath) {
        updateItemByStrategy(item, updatedItem, strategy, config)
        break
      } else if (item.children?.length) {
        getUpdatedMenuItemsRecursive(item.children, updatedItemsCopy, strategy, config)
      }
    }
  }

  return menuCopy
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
      const treeNode = isFolder
        ? getTreeNodeFromFolder(updatedItem, 'new-file')
        : getTreeNodeFromFile(updatedItem, 'new-file')

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
      console.log('should come here !!')
      item.children = item.children.filter((el) => !el.data.filePath.includes(updatedItem.filePath))
      break
    }
  }
}

/**
 * Updates the menuitem and its (possible) descendants by replacing the old filePaths / parentPaths with the new one
 */
const getUpdatedFilePathsRecursive = (item: TreeElement, newPath: string, oldPath: string): TreeElement => {
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

export const getTreeNodeFromFolder = (data: FileEntity, styleClass?: string): TreeNode<FileEntity> => {
  return {
    data,
    label: getBaseName(data.filePath),
    expandedIcon: 'pi pi-folder-open',
    collapsedIcon: 'pi pi-folder',
    type: MenuItemTypes.Folder,
    children: [],
    ...(styleClass && { styleClass }),
  }
}

const getTreeNodeFromFile = (item: FileEntity, styleClass?: string): TreeNode<FileEntity> => {
  return {
    label: getBaseName(item.filePath),
    type: MenuItemTypes.File,
    data: item,
    ...(styleClass && { styleClass }),
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
