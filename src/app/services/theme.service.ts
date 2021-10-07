import { Injectable } from '@angular/core'
import { ThemeOption } from '../interfaces/Theme'
import themes from '../../assets/themes/theme-options.json'
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {}

  setTheme(theme: string): void {
    const selectedTheme = <ThemeOption>themes.find((option) => option.name === theme)
    if (selectedTheme) {
      const { styles } = selectedTheme
      Object.keys(styles).forEach((key) => {
        const propName = '--' + key
        document.documentElement.style.setProperty(propName, styles[key])
      })
    }
  }
}
