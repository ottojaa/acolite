import { Injectable } from '@angular/core'
import { getSelectedTabEntityFromIndex } from '../../../app/electron-utils/utils'
import { binaryTypes } from '../../../app/shared/constants'
import { Doc, SelectedTab, State } from '../../../app/shared/interfaces'
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
    const tabIdx = tabs.findIndex((tab) => tab.filePath === filePath)
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
    const tabToKeepOpen = tabs.find((tab) => tab.filePath === filePath)
    if (tabToKeepOpen) {
      this.update({ filePath: tabToKeepOpen.filePath, forceDashboard: false, index: 0 }, [tabToKeepOpen])
    }
  }

  revertDelete(tab: Doc): void {
    const { textContent, filePath, extension } = tab
    const { tabs, selectedTab } = this.state.value
    const tabIdx = tabs.findIndex((fileTab) => fileTab.filePath === filePath)
    if (tabIdx > -1) {
      tabs[tabIdx].deleted = false
      this.update(selectedTab, tabs)

      const payload = {
        filePath,
        content: textContent,
        openFileAfterCreation: false,
        state: this.state.value,
      }

      if (binaryTypes.includes(extension)) {
        this.electronService.createNewImageRequest({ ...payload, encoding: 'binary' })
      } else {
        this.electronService.createNewFileRequest(payload)
      }
    }
  }

  closeAllTabs(): void {
    this.update({ filePath: '', index: 0, forceDashboard: false }, [])
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

  update(selectedTab: SelectedTab, tabs: Doc[]): void {
    const payload: StateUpdate<State>[] = [
      { key: 'selectedTab', payload: selectedTab },
      { key: 'tabs', payload: tabs },
    ]
    this.state.updateState$.next(payload)
  }

  filterClosedTab(tabs: Doc[], tabToClose: string): Doc[] {
    return tabs.filter((tab) => tab.filePath !== tabToClose)
  }

  toggleBookmark(tab: Doc): void {
    const { filePath, fileName } = tab
    const { bookmarks } = this.state.getStateParts(['bookmarks'])
    const tabIdx = bookmarks.indexOf(filePath)

    const updateBookmarks = (updated: string[], showToast: boolean) => {
      this.state.updateState$.next([{ key: 'bookmarks', payload: updated }])

      if (showToast) {
        this.dialog.openToast(`Bookmarked ${fileName}`, 'success', 2000)
      }
    }

    if (tabIdx > -1) {
      const updatedBookmarks = bookmarks.filter((bookmark) => bookmark !== filePath)
      updateBookmarks(updatedBookmarks, false)
    } else {
      const updatedBookmarks = [...bookmarks, filePath]
      updateBookmarks(updatedBookmarks, true)
    }
  }

  removeBookmark(bookmarkPath: string): void {
    const { bookmarks } = this.state.getStateParts(['bookmarks'])
    const updatedBookmarks = bookmarks.filter((bookmark) => bookmark !== bookmarkPath)

    this.state.updateState$.next([{ key: 'bookmarks', payload: updatedBookmarks }])
  }

  toggleForceDashboard(): void {
    const selectedTab = this.state.getStatePartValue('selectedTab')
    this.state.updateState$.next([
      { key: 'selectedTab', payload: { ...selectedTab, forceDashboard: !selectedTab.forceDashboard } },
    ])
  }

  private getNewSelectedTab(selectedTab: SelectedTab, tabs: Doc[]): any {
    if (selectedTab.index <= tabs.length) {
      return { path: selectedTab.filePath, index: selectedTab.index }
    }
    const newIndex = selectedTab.index - 1 >= 0 ? selectedTab.index - 1 : 0
    return tabs[newIndex] ? { path: tabs[newIndex].filePath, index: newIndex } : { path: '', index: 0 }
  }
}
