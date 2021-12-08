import { animate, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { IOutputAreaSizes } from 'angular-split'
import { Observable } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../abstract/abstract-component'
import { StateService } from '../services/state.service'
import { ThemeService } from '../services/theme.service'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('componentLoaded', [
      transition(':enter', [style({ opacity: 0 }), animate('100ms', style({ opacity: 1 }))]),
    ]),
  ],
})
export class MainComponent extends AbstractComponent implements OnInit {
  initialized$: Observable<boolean>
  sideMenuWidth: number
  editorWidth: number

  constructor(private themeService: ThemeService, public state: StateService) {
    super()
  }

  ngOnInit(): void {
    this.initialized$ = this.state.getStatePart('initialized')
    this.themeService.setTheme('Light grey')
    this.initSplitterSizes()
  }

  initSplitterSizes(): void {
    this.state
      .getStatePart('sideMenuWidth')
      .pipe(takeUntil(this.destroy$))
      .subscribe((width) => {
        this.sideMenuWidth = width
        this.editorWidth = 100 - width
      })
  }

  onDragEnd(event: { sizes: IOutputAreaSizes }): void {
    const [sideMenuWidth, _editorWidth] = event.sizes
    this.state.updateState$.next([{ key: 'sideMenuWidth', payload: sideMenuWidth as number }])
  }
}
