import { Component, Input, OnInit } from '@angular/core'
import { AbstractComponent } from 'app/abstract/abstract-component'
import { StateService } from 'app/services/state.service'
import { TabService } from 'app/services/tab.service'
import { ThemeList, ThemeService } from 'app/services/theme.service'
import { Observable } from 'rxjs'
import { takeUntil, tap } from 'rxjs/operators'
import { Doc } from '../../../../../../app/shared/interfaces'

@Component({
  selector: 'app-editor-top-bar',
  templateUrl: './editor-top-bar.component.html',
  styleUrls: ['./editor-top-bar.component.scss'],
})
export class EditorTopBarComponent extends AbstractComponent implements OnInit {
  @Input() tab: Doc
  @Input() lastModified: Date
  @Input() showToggleSwitch: boolean = false
  @Input() showMonacoThemeList: boolean = false

  isChecked: boolean
  isBookmarked: boolean

  monacoThemes$: Observable<ThemeList>
  selectedMonacoTheme$: Observable<string>

  constructor(private state: StateService, private tabService: TabService, private themeService: ThemeService) {
    super()
  }

  ngOnInit(): void {
    this.initThemeListener()
    this.initBookmarkListener()
    this.monacoThemes$ = this.themeService.getThemeList()
    this.selectedMonacoTheme$ = this.state.getStatePart('monacoEditorTheme')
  }

  initThemeListener(): void {
    this.state
      .getStatePart('markdownEditorTheme')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.isChecked = data === 'light'))
  }

  initBookmarkListener(): void {
    this.state
      .getStatePart('bookmarks')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.isBookmarked = data?.includes(this.tab.filePath)
      })
  }

  onChangeTheme(): void {
    const theme = this.isChecked ? 'light' : 'dark'
    this.state.updateState$.next([{ key: 'markdownEditorTheme', payload: theme }])
  }

  toggleBookmark(tab: Doc): void {
    this.tabService.toggleBookmark(tab)
  }
}
