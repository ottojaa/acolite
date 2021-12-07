import { Injectable } from '@angular/core'
import { ElectronService } from '../core/services'
import { SelectedTab, Tab, TreeElement } from '../interfaces/Menu'
import { getDirName, getPathSeparator } from '../utils/file-utils'
import { State, StateService, StateUpdate } from './state.service'

@Injectable({
  providedIn: 'root',
})
export class TabService {
  constructor(private state: StateService, private electronService: ElectronService) {}

  openNewTab(filePath: string): void {
    const { tabs, selectedTab } = this.state.getStateParts(['tabs', 'selectedTab'])
    const tabIdx = tabs.findIndex((tab) => tab.path === filePath)

    if (tabIdx > -1 && tabIdx !== selectedTab.index) {
      const newTab = this.getSelectedTabEntityFromIndex(tabIdx)
      this.update(newTab, tabs)
    } else if (tabIdx === -1) {
      this.electronService.readFileRequest({ filePath })
    }
  }

  closeTab(filePath: string): void {
    const { tabs, selectedTab } = this.state.getStateParts(['selectedTab', 'tabs'])
    const newTabs = this.filterClosedTab(tabs, filePath)
    const newIndex = selectedTab.index - 1 >= 0 ? selectedTab.index - 1 : 0
    const newSelectedTab = newTabs[newIndex]
      ? { path: newTabs[newIndex].path, index: newIndex }
      : { path: '', index: 0 }

    this.update(newSelectedTab, newTabs)
  }

  closeOtherTabs(filePath: string): void {
    const { tabs } = this.state.getStateParts(['selectedTab', 'tabs'])
    const tabToKeepOpen = tabs.find((tab) => tab.path === filePath)
    if (tabToKeepOpen) {
      this.update({ path: tabToKeepOpen.path, index: 0 }, [tabToKeepOpen])
    }
  }

  revertDelete(tab: Tab): void {
    const { textContent, path } = tab
    const { tabs, selectedTab, rootDirectory } = this.state.getStateParts(['selectedTab', 'tabs', 'rootDirectory'])
    const tabIdx = tabs.findIndex((tab) => tab.path === path)
    if (tabIdx > -1) {
      tabs[tabIdx].deleted = false
      this.update(selectedTab, tabs)

      const payload = {
        rootDirectory,
        path,
        content: textContent,
        openFileAfterCreation: false,
      }
      this.electronService.createNewFileRequest(payload)
    }
  }

  closeAllTabs(): void {
    this.update({ path: '', index: 0 }, [])
  }

  openTabInFileLocation(filePath: string): void {
    this.electronService.openFileLocationRequest({ filePath })
  }

  update(selectedTab: SelectedTab, tabs: Tab[], expand?: boolean): void {
    const payload: StateUpdate<State>[] = [
      { key: 'selectedTab', payload: selectedTab },
      { key: 'tabs', payload: tabs },
    ]
    this.state.updateMulti$.next(payload)
  }

  filterClosedTab(tabs: Tab[], tabToClose: string): Tab[] {
    return tabs.filter((tab) => tab.path !== tabToClose)
  }

  getSelectedTabEntityFromIndex(index: number): SelectedTab {
    const { tabs, baseDir } = this.state.getStateParts(['tabs', 'baseDir'])
    const selectedTab = tabs[index]
    if (selectedTab) {
      this.expandNodeRecursive(this.state.value.rootDirectory, selectedTab.path)

      return { path: tabs[index].path, index, activeIndent: this.getActiveIndent(baseDir, selectedTab.path) }
    } else {
      console.error(`No tab at index ${index}`)
      return null
    }
  }

  expandNodeRecursive(root: TreeElement, path: string): any {
    const expandParentRecursive = (parentNode: TreeElement) => {
      if (parentNode) {
        parentNode.expanded = true
      }

      if (parentNode?.parent) {
        expandParentRecursive(parentNode.parent)
      }
    }
    const findParentNodeRecursive = (currentNode: TreeElement, path: string) => {
      for (const node of currentNode?.children) {
        if (node.data.filePath === path) {
          expandParentRecursive(node.parent)
          return
        } else if (node.children) {
          findParentNodeRecursive(node, path)
        }
      }
    }
    findParentNodeRecursive(root, path)
  }

  getActiveIndent(rootPath: string, path: string) {
    if (!rootPath || !path) {
      return undefined
    }
    const pathDiff = path.replace(rootPath, '')
    const pathDepth = pathDiff.split(getPathSeparator()).length - 2
    const parentPath = getDirName(path)
    if (parentPath) {
      return { activeParent: parentPath, activeNode: path, indent: pathDepth }
    }
    return null
  }
}
