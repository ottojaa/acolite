import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core'
import { MenuItem } from 'primeng/api'
import { ContextMenu } from 'primeng/contextmenu'
import { Observable } from 'rxjs'
import { map, takeUntil, tap } from 'rxjs/operators'
import { AbstractComponent } from '../../../../abstract/abstract-component'
import { StateService } from '../../../../services/state.service'
import { TabService } from '../../../../services/tab.service'
import { MatTabChangeEvent } from '@angular/material/tabs'
import { Doc, SelectedTab } from '../../../../../../app/shared/interfaces'
import { allowedMarkdownEditorExtensions, allowedTextEditorExtensions } from '../../../../../../app/shared/constants'
import { getSelectedTabEntityFromIndex } from 'app/components/helpers/tab-helpers'

@Component({
  selector: 'app-file-tabs',
  templateUrl: './file-tabs.component.html',
  styleUrls: ['./file-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTabsComponent extends AbstractComponent implements OnInit {
  @Input() tabs: Doc[]
  @ViewChild('cm') cm: ContextMenu

  contextMenuItems: MenuItem[]
  selectedTab$: Observable<number>
  textEditorExtensions = allowedTextEditorExtensions
  markdownEditorExtensions = allowedMarkdownEditorExtensions

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
    }, 50)
  }

  onCloseTab(filePath: string) {
    this.tabService.closeTab(filePath)
  }

  onSelectTab(event: MatTabChangeEvent): void {
    const { selectedTab } = this.state.value
    const newSelectedTab = getSelectedTabEntityFromIndex(this.state.value, event.index)
    if (newSelectedTab.filePath !== selectedTab.filePath) {
      this.state.updateState$.next([{ key: 'selectedTab', payload: { ...newSelectedTab, forceDashboard: false } }])
    }
  }

  trackByPath(_index: number, tab: Doc): string {
    return tab.filePath
  }

  onRightClick(event: MouseEvent, tab: Doc): void {
    const { filePath } = tab
    this.contextMenuItems = this.getContextMenuItems(filePath)
    this.cm.show(event)
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
        label: 'Close Deleted',
        command: () => this.tabService.closeDeleted(),
      },
      {
        label: 'Show in folder',
        icon: 'pi pi-search',
        command: () => this.tabService.openTabInFileLocation(filePath),
      },
    ]
  }
}
