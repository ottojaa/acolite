import { trigger, transition, style, animate } from '@angular/animations'
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { MatTabGroup } from '@angular/material/tabs'
import { Observable } from 'rxjs'
import { map, takeUntil, tap } from 'rxjs/operators'
import { AbstractComponent } from '../../../../abstract/abstract-component'
import { Tab } from '../../../../interfaces/Menu'
import { StateService } from '../../../../services/state.service'

@Component({
  selector: 'app-file-tabs',
  templateUrl: './file-tabs.component.html',
  styleUrls: ['./file-tabs.component.scss'],
  animations: [
    trigger('componentLoaded', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
    ]),
  ],
})
export class FileTabsComponent extends AbstractComponent implements OnInit {
  @Input() tabs: Tab[]
  @Output() closeTab: EventEmitter<{ filePath: string }> = new EventEmitter()
  @ViewChild(MatTabGroup, { read: MatTabGroup })
  tabGroup: MatTabGroup
  selectedTab$: Observable<number>

  constructor(public state: StateService) {
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

  onCloseTab(filePath: string, index: number) {
    event.stopPropagation()
    this.closeTab.emit({ filePath })
  }

  onSelectTab(event: { index: number }): void {
    this.state.updateState$.next({ key: 'selectedTab', payload: event.index })
  }

  trackByPath(_index: number, tab: Tab): string {
    return tab.path
  }
}
