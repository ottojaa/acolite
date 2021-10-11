import { animate, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { ThemeService } from '../services/theme.service'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('componentLoaded', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
    ]),
  ],
})
export class MainComponent implements OnInit {
  loadingApp = false
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.setTheme('Light grey')
    // setTimeout(() => (this.loadingApp = false), 1000)
  }
}
