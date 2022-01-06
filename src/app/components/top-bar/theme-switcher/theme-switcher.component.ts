import { Component, Input, OnInit } from '@angular/core'
import { StateService } from 'app/services/state.service'
import { ThemeOption } from '../../../../../app/shared/interfaces'
import { ThemeService } from '../../../services/theme.service'

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
})
export class ThemeSwitcherComponent implements OnInit {
  @Input() options: ThemeOption[]

  constructor(public state: StateService) {}

  ngOnInit(): void {}

  setTheme(theme: string): void {
    this.state.updateState$.next([{ key: 'appTheme', payload: theme }])
  }
}
