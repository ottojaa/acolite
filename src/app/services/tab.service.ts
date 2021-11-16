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

    const payload: StateUpdate<State>[] = [
      { key: 'selectedTab', payload: newIndex },
      { key: 'tabs', payload: newTabs },
    ]
    this.state.updateMulti$.next(payload)
  }

  closeOtherTabs(filePath: string): void {
    const { tabs } = this.state.getStateParts(['selectedTab', 'tabs'])
    const tabToKeepOpen = tabs.find((tab) => tab.path === filePath)
    if (tabToKeepOpen) {
      const payload: StateUpdate<State>[] = [
        { key: 'selectedTab', payload: 0 },
        { key: 'tabs', payload: [tabToKeepOpen] },
      ]
      this.state.updateMulti$.next(payload)
    }
  }

  closeAllTabs(): void {
    const payload: StateUpdate<State>[] = [
      { key: 'selectedTab', payload: 0 },
      { key: 'tabs', payload: [] },
    ]
    this.state.updateMulti$.next(payload)
  }

  filterClosedTab(tabs: Tab[], tabToClose: string): Tab[] {
    return tabs.filter((tab) => tab.path !== tabToClose)
  }
}
