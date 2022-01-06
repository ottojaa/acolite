import { Component, OnInit } from '@angular/core'
import { StateService } from 'app/services/state.service'
import { MenuItem } from 'primeng/api'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
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
  tooltipText$: Observable<string>

  constructor(public state: StateService) {}

  ngOnInit() {
    this.themeOptions = themes
    this.tooltipText$ = this.state
      .getStatePart('selectedTab')
      .pipe(map((tab) => (tab.forceDashboard ? 'Show tabs' : 'Show dashboard')))
  }

  forceDashboard(): void {
    const selectedTab = this.state.getStatePartValue('selectedTab')
    this.state.updateState$.next([
      { key: 'selectedTab', payload: { ...selectedTab, forceDashboard: !selectedTab.forceDashboard } },
    ])
  }
}
