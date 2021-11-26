import { Component, ElementRef, NgZone, ViewChild } from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { debounceTime, take, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../../../abstract/abstract-component'
import { ElectronService } from '../../../core/services'
import { SearchResult } from '../../../interfaces/Menu'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { TabService } from '../../../services/tab.service'

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent extends AbstractComponent {
  @ViewChild('searchbar') searchbar: ElementRef
  openDrop: boolean = false
  selectedItem: File
  searchResults$: Observable<SearchResult[]>
  searchQuery: string
  debouncedSearch$ = new Subject<string>()

  constructor(
    private electronService: ElectronService,
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

  onOpenDrop(event: MouseEvent, state: boolean) {
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
    this.zone.run(() => {
      this.dialogService
        .openSearchBuilder()
        .pipe(take(1))
        .subscribe((data) => console.log(data))
    })
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

    const baseDir = this.state.getStatePartValue('baseDir')
    this.electronService.searchFiles({ searchOpts: { content: value, baseDir } })
  }
}
