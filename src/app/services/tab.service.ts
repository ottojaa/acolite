import { Injectable } from '@angular/core'
import { getSelectedTabEntityFromIndex } from '../../../app/electron-utils/utils'
import { Tab, SelectedTab, State } from '../../../app/shared/interfaces'
import { ElectronService } from '../core/services'
import { StateService, StateUpdate } from './state.service'

@Injectable({
  providedIn: 'root',
})
export class TabService {
  constructor(private state: StateService, private electronService: ElectronService) {}

  openNewTab(filePath: string): void {
    const { tabs, selectedTab } = this.state.getStateParts(['tabs', 'selectedTab'])
    const tabIdx = tabs.findIndex((tab) => tab.path === filePath)
    const state = this.state.value

    if (tabIdx > -1 && tabIdx !== selectedTab.index) {
      const newTab = getSelectedTabEntityFromIndex(state, tabIdx)
      this.update(newTab, tabs)
    } else if (tabIdx === -1) {
      this.electronService.readFileRequest({ filePath, state })
    }
    // Expand nodes recursive here
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
    const { tabs, selectedTab } = this.state.value
    const tabIdx = tabs.findIndex((tab) => tab.path === path)
    if (tabIdx > -1) {
      tabs[tabIdx].deleted = false
      this.update(selectedTab, tabs)

      const payload = {
        path,
        content: textContent,
        openFileAfterCreation: false,
        state: this.state.value,
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
    this.state.updateState$.next(payload)
  }

  filterClosedTab(tabs: Tab[], tabToClose: string): Tab[] {
    return tabs.filter((tab) => tab.path !== tabToClose)
  }
}
