import { Component, OnInit } from '@angular/core'
import { StateService } from 'app/services/state.service'
import { MenuItem } from 'primeng/api'
import { ThemeOption } from '../../../../../app/shared/interfaces'
import themes from '../../../../assets/themes/theme-options.json'
@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
  items: MenuItem[]
  query: string
  results: any[]
  themeOptions: ThemeOption[]

  constructor(public state: StateService) {}

  ngOnInit() {
    this.themeOptions = themes
  }

  forceDashboard(): void {
    const selectedTab = this.state.getStatePartValue('selectedTab')
    this.state.updateState$.next([
      { key: 'selectedTab', payload: { ...selectedTab, forceDashboard: !selectedTab.forceDashboard } },
    ])
  }
}
