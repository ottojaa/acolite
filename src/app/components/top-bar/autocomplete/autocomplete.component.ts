import { ChangeDetectionStrategy, Component, ElementRef, NgZone, ViewChild } from '@angular/core'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { MatMenu } from '@angular/material/menu'
import { Observable, Subject } from 'rxjs'
import { debounceTime, take, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../../../abstract/abstract-component'
import { ElectronService } from '../../../core/services'
import { SearchResult } from '../../../interfaces/Menu'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { TabService } from '../../../services/tab.service'
import { SearchBuilderDialogComponent } from '../../dialogs/search-builder-dialog/search-builder-dialog.component'

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent extends AbstractComponent {
  @ViewChild('searchbar', { read: ElementRef, static: false }) searchbar: MatMenu
  openDrop: boolean = false
  selectedItem: File
  searchResults$: Observable<SearchResult[]>
  searchQuery: string
  dialogOpen: boolean = false
  debouncedSearch$ = new Subject<string>()

  constructor(
    private electronService: ElectronService,
    private matDialog: MatDialog,
    private state: StateService,
    private tabService: TabService,
    private dialogService: AppDialogService,
    private zone: NgZone
  ) {
    super()
    this.searchResults$ = this.state.getStatePart('searchResults')
    this.debouncedSearch$.pipe(takeUntil(this.destroy$), debounceTime(20)).subscribe(() => {
      this.onSearchFiles()
    })
  }

  onOpenDrop(event: Event, state: boolean) {
    const target = event.target as HTMLElement
    if (!target.classList.contains('keyboard-navigation-item')) {
      this.openDrop = state
      if (this.openDrop) {
        this.onSearchFiles()
      }
    }
  }

  trackByPath<T extends { filePath: string }>(_index: number, item: T): string {
    return item.filePath
  }

  openSearchBuilder(): void {
    /* if (this.dialogOpen) {
      this.dialogOpen = false
      this.matDialog.closeAll()
      return
    }

    this.dialogOpen = true

    this.zone.run(() => {
      this.dialogService
        .openSearchBuilder(this.searchbar)
        .pipe(take(1))
        .subscribe((data) => {
          this.dialogOpen = false
          if (data) {
            this.dialogService.openToast('Search preferences updated', 'success')
          }
        })
    }) */
  }

  onSelectItem<T extends { filePath: string }>(file: T) {
    this.tabService.openNewTab(file.filePath)
    this.openDrop = false
  }

  search(): void {
    this.debouncedSearch$.next(this.searchQuery)
  }

  onSearchFiles() {
    const value = (this.searchQuery || '').toLowerCase()
    const searchResults = this.state.getStatePartValue('searchResults')
    if (!value || value.length < 3) {
      if (searchResults.length) {
        this.state.updateState$.next({ key: 'searchResults', payload: [] })
      }
      return
    }

    if (searchResults.length && !this.openDrop) {
      this.openDrop = true
    }

    const { baseDir, searchPreferences } = this.state.getStateParts(['baseDir', 'searchPreferences'])
    this.electronService.searchFiles({ searchOpts: { content: value, baseDir, searchPreferences } })
  }
}
