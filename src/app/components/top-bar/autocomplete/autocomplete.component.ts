import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core'
import * as faker from 'faker'
import { Observable, Subject } from 'rxjs'
import { debounceTime, filter, switchMap, takeUntil, tap } from 'rxjs/operators'
import { SearchResponses, StoreResponses } from '../../../../../app/actions'
import { AbstractComponent } from '../../../abstract/abstract-component'
import { ElectronService } from '../../../core/services'
import { fileExtensionIcons } from '../../../entities/file/constants'
import { SearchResult } from '../../../interfaces/Menu'
import { StateService } from '../../../services/state.service'

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent extends AbstractComponent {
  openDrop: boolean = false
  selectedItem: File
  searchResults$: Observable<SearchResult[]>
  searchQuery: string
  debouncedSearch$ = new Subject<string>()

  constructor(private electronService: ElectronService, private state: StateService) {
    super()
    this.searchResults$ = this.state.getStatePart('searchResults')
    this.debouncedSearch$.pipe(takeUntil(this.destroy$), debounceTime(20)).subscribe(() => {
      this.onSearchFiles()
    })
  }

  onOpenDrop(state: boolean) {
    this.openDrop = state
  }

  trackByPath<T extends { filePath: string }>(_index: number, item: T): string {
    return item.filePath
  }

  getFileExtensionIconName(extension: string | undefined): string | null {
    if (!extension) {
      return 'folder'
    }
    const icon = fileExtensionIcons.find((e) => e.acceptedExtensions.includes(extension))
    return icon ? icon.name : null
  }

  onSelectItem(file: File) {
    this.selectedItem = file
  }

  search(): void {
    this.debouncedSearch$.next(this.searchQuery)
  }

  onSearchFiles() {
    const value = (this.searchQuery || '').toLowerCase()

    if (!value || value.length < 3) {
      if (this.state.getStatePartValue('searchResults').length) {
        this.state.updateState$.next({ key: 'searchResults', payload: [] })
      }
      return
    }

    const baseDir = this.state.getStatePartValue('baseDir')
    this.electronService.searchFiles({ searchOpts: { content: value, baseDir } })
  }
}
