import { Injectable } from '@angular/core'
import { ElectronService } from '../core/services'
import { StateService } from './state.service'

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
}
