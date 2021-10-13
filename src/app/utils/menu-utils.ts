import { TreeNode } from 'primeng/api'
import isEqual from 'lodash/isEqual'
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
    return {
      label: getFileNameFromPath(element.filePath),
      icon: 'pi pi-file',
      type: MenuItemTypes.File,
      data: element,
    }
  }
  throw new Error('createMenuItemsRecursive failed, invalid element')
}

/* const addToMenuItems = (menuItems: TreeNode[], newItem: FileEntity | TreeElement) => {
  if (isFolder(newItem)) {
    const { data } = newItem
    findAndUpdateParentRecursive()
  } else if (isFile(newItem)) {
  }
} */

const test = {
  data: {
    filePath: '/Users/ottojaakonmaki/Documents/test-folder-2/ss',
    parentPath: '/Users/ottojaakonmaki/Documents/test-folder-2',
    type: 'folder',
    size: 64,
    createdAt: '2021-10-12T20:36:01.056Z',
    modifiedAt: '2021-10-12T20:36:01.056Z',
  },
  children: [],
}

const findAndUpdateParentRecursive = (menuItems: TreeNode<FileEntity>[], newItem: TreeElement) => {
  for (let item of menuItems) {
    if (item.data.filePath === newItem.data.parentPath) {
      console.log('item found')
    } else if (item.children.length) {
      findAndUpdateParentRecursive(item.children, newItem)
    }
  }

  /* return parentFound
    ? menuItemsCopy
    : [
        ...menuItemsCopy,
        {
          ...newItem,
          label: getFileNameFromPath(newItem.data.filePath),
          type: MenuItemTypes.Folder,
          expandedIcon: 'pi pi-folder-open',
          collapsedIcon: 'pi pi-folder',
        },
      ] */
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
