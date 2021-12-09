import { Injectable } from '@angular/core'
import { getSelectedTabEntityFromIndex } from '../../../app/electron-utils/utils'
import { Tab, SelectedTab, State } from '../../../app/shared/interfaces'
import { ElectronService } from '../core/services'
import { AppDialogService } from './dialog.service'
import { StateService, StateUpdate } from './state.service'

@Injectable({
  providedIn: 'root',
})
export class TabService {
  constructor(
    private state: StateService,
    private electronService: ElectronService,
    private dialog: AppDialogService
  ) {}

  openNewTab(filePath: string): void {
    const { tabs } = this.state.getStateParts(['tabs', 'selectedTab'])
    const tabIdx = tabs.findIndex((tab) => tab.path === filePath)
    const state = this.state.value

    if (tabIdx > -1) {
      const newTab = getSelectedTabEntityFromIndex(state, tabIdx)
      this.update({ ...newTab, forceDashboard: false }, tabs)
    } else if (tabIdx === -1) {
      this.electronService.readFileRequest({ filePath, state })
    }
  }

  closeTab(filePath: string): void {
    const { tabs, selectedTab } = this.state.getStateParts(['selectedTab', 'tabs'])
    const newTabs = this.filterClosedTab(tabs, filePath)
    const newSelectedTab = this.getNewSelectedTab(selectedTab, newTabs)

    this.update(newSelectedTab, newTabs)
  }

  closeOtherTabs(filePath: string): void {
    const { tabs } = this.state.getStateParts(['selectedTab', 'tabs'])
    const tabToKeepOpen = tabs.find((tab) => tab.path === filePath)
    if (tabToKeepOpen) {
      this.update({ path: tabToKeepOpen.path, forceDashboard: false, index: 0 }, [tabToKeepOpen])
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
    this.update({ path: '', index: 0, forceDashboard: false }, [])
  }

  closeDeleted(): void {
    const { tabs, selectedTab } = this.state.getStateParts(['selectedTab', 'tabs'])
    const newTabs = tabs.filter((tab) => !tab.deleted)
    if (newTabs.length === tabs.length) {
      return
    }

    const newSelectedTab = this.getNewSelectedTab(selectedTab, newTabs)
    this.update(newSelectedTab, newTabs)
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

  private getNewSelectedTab(selectedTab: SelectedTab, tabs: Tab[]): any {
    const newIndex = selectedTab.index - 1 >= 0 ? selectedTab.index - 1 : 0
    return tabs[newIndex] ? { path: tabs[newIndex].path, index: newIndex } : { path: '', index: 0 }
  }

  toggleBookmark(tab: Tab): void {
    const { path, fileName } = tab
    const { bookmarks, bookmarkedFiles } = this.state.getStateParts(['bookmarks', 'bookmarkedFiles'])
    const tabIdx = bookmarks.indexOf(path)

    const updateBookmarks = (updated: string[], showToast: boolean) => {
      this.state.updateState$.next([{ key: 'bookmarks', payload: updated }])
      this.electronService.updateBookmarkedFiles({
        bookmarkPath: path,
        bookmarkedFiles: bookmarkedFiles,
      })

      if (showToast) {
        this.dialog.openToast(`Bookmarked ${fileName}`, 'success', 2000)
      }
    }

    if (tabIdx > -1) {
      const updatedBookmarks = bookmarks.filter((bookmark) => bookmark !== path)
      updateBookmarks(updatedBookmarks, false)
    } else {
      const updatedBookmarks = [...bookmarks, path]
      updateBookmarks(updatedBookmarks, true)
    }
  }

  removeBookmark(bookmarkPath: string): void {
    const { bookmarks, bookmarkedFiles } = this.state.getStateParts(['bookmarks', 'bookmarkedFiles'])
    const updatedBookmarks = bookmarks.filter((bookmark) => bookmark !== bookmarkPath)

    this.state.updateState$.next([{ key: 'bookmarks', payload: updatedBookmarks }])
    this.electronService.updateBookmarkedFiles({
      bookmarkPath,
      bookmarkedFiles: bookmarkedFiles,
    })
  }

  toggleForceDashboard(): void {
    const selectedTab = this.state.getStatePartValue('selectedTab')
    this.state.updateState$.next([
      { key: 'selectedTab', payload: { ...selectedTab, forceDashboard: !selectedTab.forceDashboard } },
    ])
  }
}
