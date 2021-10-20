import { cloneDeep } from 'lodash'
import { TreeNode } from 'primeng/api'
import { patchCollectionBy } from '../../../app/utils'
import { FileEntity, MenuItemTypes, TreeElement } from '../interfaces/Menu'

export type UpdateStrategy = 'create' | 'rename' | 'delete'

export interface Config {
  oldPath?: string
  newPath?: string
  isFolder?: boolean
  isInRootDir?: boolean
}

export const folderStructureToMenuItems = (
  baseDir: string,
  folderStruct: (TreeElement | FileEntity)[]
): TreeNode<FileEntity>[] => folderStruct.map((descendant) => createMenuItemsRecursive(baseDir, descendant))

const createMenuItemsRecursive = (baseDir: string, element: TreeElement | FileEntity): TreeNode => {
  if (isFolder(element) && element.data.type === 'folder') {
    const { data, children } = element
    return {
      label: getFileNameFromPath(data.filePath),
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
  updatedItem: FileEntity,
  strategy: UpdateStrategy,
  config?: Config
): TreeElement[] => {
  for (let item of menuItems) {
    // Find the updated item's parent, and update it
    if (item.data.filePath === updatedItem.parentPath) {
      switch (strategy) {
        case 'create': {
          const treeNode =
            updatedItem.type === 'folder'
              ? getTreeNodeFromFolder(updatedItem, 'new-file')
              : getTreeNodeFromFile(updatedItem, 'new-file')

          item.children = [...item.children, treeNode]
          item.expanded = true
          break
        }
        case 'rename': {
          item = getUpdatedFilePathsRecursive(item, config.newPath, config.oldPath)
          break
        }
        case 'delete': {
          item.children = item.children.filter((el) => el.data.filePath !== updatedItem.filePath)
          break
        }
      }
      break
    } else if (item.children?.length) {
      getUpdatedMenuItemsRecursive(item.children, updatedItem, strategy, config)
    }
  }

  return menuItems
}

/**
 * Updates the menuitem and its (possible) descendants by replacing the old filePaths / parentPaths with the new one
 */
const getUpdatedFilePathsRecursive = (item: TreeElement, newPath: string, oldPath: string): TreeElement => {
  item.data.filePath = item.data.filePath.replace(oldPath, newPath)
  item.data.parentPath = item.data.parentPath.replace(oldPath, newPath)

  if (item.data.filePath === newPath) {
    item.label = getFileNameFromPath(newPath)
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
    label: getFileNameFromPath(data.filePath),
    expandedIcon: 'pi pi-folder-open',
    collapsedIcon: 'pi pi-folder',
    type: MenuItemTypes.Folder,
    children: [],
    ...(styleClass && { styleClass }),
  }
}

const getTreeNodeFromFile = (item: FileEntity, styleClass?: string): TreeNode<FileEntity> => {
  return {
    label: getFileNameFromPath(item.filePath),
    type: MenuItemTypes.File,
    data: item,
    ...(styleClass && { styleClass }),
  }
}

export const addFileToBaseDir = (menuItems: TreeNode<FileEntity>[], newItem: FileEntity) => {
  return [...menuItems, newItem]
}

const getFileNameFromPath = (path: string) => {
  const lastIdx = path.lastIndexOf('/')
  return path.substring(lastIdx + 1)
}

const isFolder = (el: TreeElement | FileEntity): el is TreeElement => {
  return 'data' in el
}

const isFile = (el: TreeElement | FileEntity): el is FileEntity => {
  return !('data' in el)
}
