import { Component, Input, OnInit } from '@angular/core'
import { ThemeOption } from '../../../../../app/shared/interfaces'
import { ThemeService } from '../../../services/theme.service'

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
})
export class ThemeSwitcherComponent implements OnInit {
  @Input() options: ThemeOption[]

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {}
}
