import { TreeNode } from 'primeng/api'
import { FileEntity, MenuItemTypes, TreeElement } from '../interfaces/Menu'
import { cloneDeep } from 'lodash'

export const folderStructureToMenuItems = (
  baseDir: string,
  folderStruct: (TreeElement | FileEntity)[]
): TreeNode<FileEntity>[] => folderStruct.map((descendant) => createMenuItemsRecursive(baseDir, descendant))

const createMenuItemsRecursive = (baseDir: string, element: TreeElement | FileEntity): TreeNode => {
  if (isFolder(element)) {
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
    return getTreeNodeFromEntity(element)
  }
  throw new Error('createMenuItemsRecursive failed, invalid element')
}

export const getUpdatedMenuItemsRecursive = (
  menuItems: TreeNode<FileEntity>[],
  newItem: FileEntity
): TreeNode<FileEntity>[] => {
  for (let item of menuItems) {
    if (item.data.filePath === newItem.parentPath) {
      item.children = [...item.children, getTreeNodeFromEntity(newItem)]
      item.expanded = true
      break
    } else if (item.children?.length) {
      getUpdatedMenuItemsRecursive(item.children, newItem)
    }
  }

  return menuItems
}

export const makeFolderTreeNodeFromFileEntity = (data: FileEntity): TreeNode<FileEntity> => {
  return {
    data,
    label: getFileNameFromPath(data.filePath),
    type: MenuItemTypes.Folder,
    expandedIcon: 'pi pi-folder-open',
    collapsedIcon: 'pi pi-folder',
    children: [],
  }
}

export const addFileToBaseDir = (menuItems: TreeNode<FileEntity>[], newItem: FileEntity) => {
  console.log('added file to base dir: ', newItem)
  return [...menuItems, newItem]
}

const getTreeNodeFromEntity = (item: FileEntity): TreeNode => {
  return {
    label: getFileNameFromPath(item.filePath),
    icon: 'pi pi-file',
    type: MenuItemTypes.File,
    data: item,
  }
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
