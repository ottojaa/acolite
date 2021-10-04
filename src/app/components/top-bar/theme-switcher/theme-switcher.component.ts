import { Component, Input, OnInit } from '@angular/core'
import { ThemeOption } from '../../../interfaces/Theme'

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
})
export class ThemeSwitcherComponent implements OnInit {
  @Input() options: ThemeOption[]

  constructor() {}

  ngOnInit(): void {
    this.setTheme('Light grey')
  }

  setTheme(theme: string): void {
    const selectedTheme = this.options.find((option) => option.name === theme)
    if (selectedTheme) {
      const { styles } = selectedTheme
      Object.keys(styles).forEach((key) => {
        const propName = '--' + key
        document.documentElement.style.setProperty(propName, styles[key])
      })
    }
  }
}
