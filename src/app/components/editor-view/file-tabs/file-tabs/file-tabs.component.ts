import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core'
import { MenuItem } from 'primeng/api'
import { ContextMenu } from 'primeng/contextmenu'
import { Observable } from 'rxjs'
import { map, takeUntil, tap } from 'rxjs/operators'
import { AbstractComponent } from '../../../../abstract/abstract-component'
import { SelectedTab, Tab } from '../../../../interfaces/Menu'
import { StateService } from '../../../../services/state.service'
import { TabService } from '../../../../services/tab.service'
import { MatTabChangeEvent } from '@angular/material/tabs'

@Component({
  selector: 'app-file-tabs',
  templateUrl: './file-tabs.component.html',
  styleUrls: ['./file-tabs.component.scss'],
})
export class FileTabsComponent extends AbstractComponent implements OnInit {
  @Input() tabs: Tab[]
  @ViewChild('cm') cm: ContextMenu

  contextMenuItems: MenuItem[]
  selectedTab$: Observable<number>

  constructor(public state: StateService, public cdRef: ChangeDetectorRef, public tabService: TabService) {
    super()
  }

  ngOnInit(): void {
    this.selectedTab$ = this.state.getStatePart('selectedTab').pipe(
      takeUntil(this.destroy$),
      tap((selectedTab) => this.scrollSelectedTabIntoView(selectedTab)),
      map((selectedTab) => selectedTab.index)
    )
  }

  scrollSelectedTabIntoView(tab: SelectedTab): void {
    setTimeout(() => {
      const els = Array.from(document.querySelectorAll('.mat-tab-label'))
      const selectedTab = els[tab?.index]
      if (selectedTab) {
        selectedTab.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }

  onCloseTab(filePath: string) {
    this.tabService.closeTab(filePath)
  }

  onSelectTab(event: MatTabChangeEvent): void {
    const selectedTab = this.state.getStatePartValue('selectedTab')
    const newSelectedTab = this.tabService.getSelectedTabEntityFromIndex(event.index)
    if (newSelectedTab.path !== selectedTab.path) {
      this.state.updateState$.next({ key: 'selectedTab', payload: newSelectedTab })
    }
  }

  trackByPath(_index: number, tab: Tab): string {
    return tab.path
  }

  onRightClick(event: MouseEvent, tab: Tab): void {
    const { path } = tab
    this.contextMenuItems = this.getContextMenuItems(path)
    this.cm.show(event)
  }

  revertDelete(tab: Tab): void {
    this.tabService.revertDelete(tab)
  }

  getContextMenuItems(filePath: string): MenuItem[] {
    return [
      {
        label: 'Close',
        command: () => this.tabService.closeTab(filePath),
      },
      {
        label: 'Close Others',
        command: () => this.tabService.closeOtherTabs(filePath),
      },
      {
        label: 'Close All',
        command: () => this.tabService.closeAllTabs(),
      },
      {
        label: 'Show in folder',
        icon: 'pi pi-search',
        command: () => this.tabService.openTabInFileLocation(filePath),
      },
    ]
  }
}
