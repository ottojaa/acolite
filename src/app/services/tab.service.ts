import { Injectable } from '@angular/core'
import { ElectronService } from '../core/services'
import { Tab } from '../interfaces/Menu'
import { State, StateService, StateUpdate } from './state.service'

@Injectable({
  providedIn: 'root',
})
export class TabService {
  constructor(private state: StateService, private electronService: ElectronService) {}

  openNewTab(filePath: string): void {
    const { tabs, selectedTab } = this.state.getStateParts(['tabs', 'selectedTab'])
    const tabIdx = tabs.findIndex((tab) => tab.path === filePath)

    if (tabIdx > -1 && tabIdx !== selectedTab) {
      this.state.updateState$.next({ key: 'selectedTab', payload: tabIdx })
    } else if (tabIdx === -1) {
      this.electronService.readFileRequest({ filePath })
    }
  }

  closeTab(filePath: string): void {
    const { tabs, selectedTab } = this.state.getStateParts(['selectedTab', 'tabs'])
    const newTabs = this.filterClosedTab(tabs, filePath)
    const newIndex = selectedTab - 1 >= 0 ? selectedTab - 1 : 0

    this.update(newIndex, newTabs)
  }

  closeOtherTabs(filePath: string): void {
    const { tabs } = this.state.getStateParts(['selectedTab', 'tabs'])
    const tabToKeepOpen = tabs.find((tab) => tab.path === filePath)
    if (tabToKeepOpen) {
      this.update(0, [tabToKeepOpen])
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
    this.update(0, [])
  }

  openTabInFileLocation(filePath: string): void {
    this.electronService.openFileLocationRequest({ filePath })
  }

  update(selectedTab: number, tabs: Tab[]): void {
    const payload: StateUpdate<State>[] = [
      { key: 'selectedTab', payload: selectedTab },
      { key: 'tabs', payload: tabs },
    ]
    this.state.updateMulti$.next(payload)
  }

  filterClosedTab(tabs: Tab[], tabToClose: string): Tab[] {
    return tabs.filter((tab) => tab.path !== tabToClose)
  }
}
