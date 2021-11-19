import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { MenuItem } from 'primeng/api'
import { ContextMenu } from 'primeng/contextmenu'
import { Observable } from 'rxjs'
import { takeUntil, tap } from 'rxjs/operators'
import { AbstractComponent } from '../../../../abstract/abstract-component'
import { Tab } from '../../../../interfaces/Menu'
import { StateService } from '../../../../services/state.service'
import { TabService } from '../../../../services/tab.service'

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
      tap((selectedTab) => this.scrollSelectedTabIntoView(selectedTab))
    )
  }

  scrollSelectedTabIntoView(tabIdx: number): void {
    setTimeout(() => {
      const els = Array.from(document.querySelectorAll('.mat-tab-label'))
      const selectedTab = els[tabIdx]
      if (selectedTab) {
        selectedTab.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }

  onCloseTab(filePath: string) {
    this.tabService.closeTab(filePath)
  }

  onSelectTab(event: { index: number }): void {
    this.state.updateState$.next({ key: 'selectedTab', payload: event.index })
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
