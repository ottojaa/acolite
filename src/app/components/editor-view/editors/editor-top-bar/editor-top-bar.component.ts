import { Component, Input, OnInit } from '@angular/core'
import { AbstractComponent } from 'app/abstract/abstract-component'
import { ElectronService } from 'app/core/services'
import { AppDialogService } from 'app/services/dialog.service'
import { StateService } from 'app/services/state.service'
import { takeUntil } from 'rxjs/operators'
import { Tab } from '../../../../../../app/shared/interfaces'

@Component({
  selector: 'app-editor-top-bar',
  templateUrl: './editor-top-bar.component.html',
  styleUrls: ['./editor-top-bar.component.scss'],
})
export class EditorTopBarComponent extends AbstractComponent implements OnInit {
  @Input() tab: Tab

  isChecked: boolean
  isBookmarked: boolean

  constructor(private state: StateService, private electronService: ElectronService, private dialog: AppDialogService) {
    super()
  }

  ngOnInit(): void {
    this.initThemeListener()
    this.initBookmarkListener()
  }

  initThemeListener(): void {
    this.state
      .getStatePart('editorTheme')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.isChecked = data === 'light'))
  }

  initBookmarkListener(): void {
    this.state
      .getStatePart('bookmarks')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.isBookmarked = data?.includes(this.tab.path)
      })
  }

  onChangeTheme(): void {
    const theme = this.isChecked ? 'light' : 'dark'
    this.state.updateState$.next([{ key: 'editorTheme', payload: theme }])
  }

  toggleBookmark(tab: Tab): void {
    const { path, fileName } = tab
    const { bookmarks, bookmarkedFiles } = this.state.getStateParts(['bookmarks', 'bookmarkedFiles'])
    const tabIdx = bookmarks.indexOf(path)

    const updateBookmarks = (updated: string[], showToast: boolean) => {
      this.state.updateState$.next([{ key: 'bookmarks', payload: updated }])
      this.electronService.getBookmarked({
        bookmarkPath: path,
        bookmarkedFiles: bookmarkedFiles,
      })

      if (showToast) {
        this.dialog.openToast(`Bookmarked ${fileName}`, 'success', 2000)
      }
    }

    if (tabIdx > -1) {
      const updatedBookmarks = bookmarks.filter((bookmark) => bookmark !== path)
      updateBookmarks(updatedBookmarks, false)
    } else {
      const updatedBookmarks = [...bookmarks, path]
      updateBookmarks(updatedBookmarks, true)
    }
  }
}
