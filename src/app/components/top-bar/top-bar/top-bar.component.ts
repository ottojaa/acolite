import { Component, OnInit } from '@angular/core'
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

  constructor() {}

  ngOnInit() {
    this.themeOptions = themes
  }

  openThemeModal(): void {
    console.log('clicked')
  }

  search(event: CustomEvent): void {
    this.results = []
    console.log(event)
  }
}
