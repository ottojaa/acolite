import { Component, OnInit } from '@angular/core'
import { StateService } from 'app/services/state.service'
import { MenuItem } from 'primeng/api'
import themes from '../../../../assets/themes/theme-options.json'
import { ThemeOption } from '../../../interfaces/Theme'
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
    this.state.updateState$.next({ key: 'forceDashboard', payload: true })
  }
}
