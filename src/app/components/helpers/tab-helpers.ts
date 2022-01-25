import { StateUpdate } from 'app/services/state.service'
import { State, SelectedTab, Doc } from '../../../../app/shared/interfaces'

export const getSelectedTabEntityFromIndex = (state: State, index: number): SelectedTab => {
  const { tabs, baseDir } = state
  const selectedTab = tabs[index]
  if (selectedTab) {
    const filePath = tabs[index].filePath
    const activeIndent = getActiveIndent(baseDir, selectedTab.filePath)

    return { filePath, index, activeIndent, forceDashboard: false }
  } else {
    console.error(`No tab at index ${index}`)
    return null
  }
}

export const getActiveIndent = (rootPath: string, path: string) => {
  if (!rootPath || !path) {
    return undefined
  }
  const pathDiff = path.replace(rootPath, '')
  const pathDepth = pathDiff.split(window.path.getPathSeparator()).length - 2
  const parentPath = window.path.getDirName(path)
  if (parentPath) {
    return { activeParent: parentPath, activeNode: path, indent: pathDepth }
  }
  return null
}

export const addTabAndSetAsSelectedTab = (state: State, newTab: Doc) => {
  const { tabs } = state
  const tabIdx = tabs.findIndex((tab) => tab.filePath === newTab.filePath)
  if (tabIdx === -1) {
    tabs.push(newTab)
  }

  const selectedTabIndex = tabIdx === -1 ? tabs.length - 1 : tabIdx
  const selectedTab = getSelectedTabEntityFromIndex(state, selectedTabIndex)

  const payload: StateUpdate<State>[] = [
    { key: 'tabs', payload: tabs },
    { key: 'selectedTab', payload: selectedTab },
  ]

  return payload
}
