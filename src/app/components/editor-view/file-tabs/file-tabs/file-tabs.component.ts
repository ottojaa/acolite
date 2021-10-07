import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatTabGroup, MatTab } from '@angular/material/tabs'

@Component({
  selector: 'app-file-tabs',
  templateUrl: './file-tabs.component.html',
  styleUrls: ['./file-tabs.component.scss'],
})
export class FileTabsComponent implements OnInit {
  @ViewChild(MatTabGroup, { read: MatTabGroup })
  @ViewChildren(MatTab, { read: MatTab })
  tabGroup: MatTabGroup
  tabNodes: QueryList<MatTab>
  closedTabs = []
  tabs = [
    {
      tabType: 0,
      name: 'Main',
    },
    {
      tabType: 1,
      name: 'Dashboard',
    },
    {
      tabType: 2,
      name: 'Tests',
    },
  ]

  ngOnInit(): void {}

  closeTab(index: number) {
    event.stopPropagation()
    this.closedTabs.push(index)
    this.tabGroup.selectedIndex = this.tabNodes.length - 1
  }
}
