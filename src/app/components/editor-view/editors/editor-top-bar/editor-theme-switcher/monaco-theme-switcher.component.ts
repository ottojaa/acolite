import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { StateService } from 'app/services/state.service'
import { MonacoTheme, ThemeList } from 'app/services/theme.service'

@Component({
  selector: 'app-monaco-theme-switcher',
  templateUrl: './monaco-theme-switcher.component.html',
  styleUrls: ['./monaco-theme-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonacoThemeSwitcherComponent {
  @Input() options: ThemeList
  @Input() selectedTheme: string

  constructor(public state: StateService) {}

  setTheme(theme: string): void {
    this.state.updateState$.next([{ key: 'monacoEditorTheme', payload: theme }])
  }
}
