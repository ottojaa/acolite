import { TreeNode } from 'primeng/api'
import { FileEntity, MenuItemTypes, TreeElement } from '../interfaces/Menu'

export type UpdateStrategy = 'create' | 'rename' | 'delete'

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
  strategy: UpdateStrategy
): TreeElement[] => {
  removeExistingStyleClasses(menuItems)

  for (let item of menuItems) {
    if (item.data.filePath === updatedItem.parentPath) {
      switch (strategy) {
        case 'create': {
          const treeNode =
            item.data.type === 'folder'
              ? getTreeNodeFromFolder(updatedItem, 'new-file')
              : getTreeNodeFromFile(updatedItem, 'new-file')

          item.children = [...item.children, treeNode]
          item.expanded = true
          break
        }
        case 'rename': {
          item.label = getFileNameFromPath(updatedItem.filePath)
          break
        }
        case 'delete': {
          item.children = item.children.filter((el) => el.data.filePath !== updatedItem.filePath)
          break
        }
      }
      break
    } else if (item.children?.length) {
      getUpdatedMenuItemsRecursive(item.children, updatedItem, strategy)
    }
  }

  return menuItems
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
    type: MenuItemTypes.Folder,
    expandedIcon: 'pi pi-folder-open',
    collapsedIcon: 'pi pi-folder',
    children: [],
    ...(styleClass && { styleClass }),
  }
}

const getTreeNodeFromFile = (item: FileEntity, styleClass?: string): TreeNode<FileEntity> => {
  return {
    label: getFileNameFromPath(item.filePath),
    icon: 'pi pi-file',
    type: MenuItemTypes.File,
    data: item,
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
