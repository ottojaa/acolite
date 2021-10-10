import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { MatTabGroup } from '@angular/material/tabs'

@Component({
  selector: 'app-file-tabs',
  templateUrl: './file-tabs.component.html',
  styleUrls: ['./file-tabs.component.scss'],
})
export class FileTabsComponent implements OnInit {
  @Input() tabs: any[]
  @Output() closeTab: EventEmitter<{ tabName: string; index: number }> = new EventEmitter()
  @ViewChild(MatTabGroup, { read: MatTabGroup })
  tabGroup: MatTabGroup

  ngOnInit(): void {
    console.log(this.tabs)
  }

  onCloseTab(tabName: string, index: number) {
    event.stopPropagation()
    this.closeTab.emit({ tabName, index })
    this.tabGroup.selectedIndex = index - 1
  }
}
