import { animate, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'
import { StoreResponses } from '../../../../app/actions'
import { SearchResult, Tab } from '../../interfaces/Menu'
import { StateService } from '../../services/state.service'
import { TabService } from '../../services/tab.service'

@Component({
  selector: 'app-editor-view',
  templateUrl: './editor-view.component.html',
  styleUrls: ['./editor-view.component.scss'],
  animations: [
    trigger('componentLoaded', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms 0ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate('300ms 0ms ease-in-out', style({ opacity: 0, transform: 'translateX(-20px)' })),
      ]),
    ]),
  ],
})
export class EditorViewComponent implements OnInit {
  tabs$: Observable<Tab[]>
  selectedTab$: Observable<string>

  recentlyModified: SearchResult[]
  bookmarked: SearchResult[]

  recentlyModifiedInit = false
  bookmarksInit = false
  contrastColor: string

  constructor(private state: StateService, public tabService: TabService, public electronService: ElectronService) {
    this.electronService.on(StoreResponses.GetRecentlyModifiedSuccess, (_ipcEvent: any, files: SearchResult[]) => {
      this.recentlyModified = [...files]
      setTimeout(() => {
        this.recentlyModifiedInit = true
      }, 300)
    })
    this.electronService.on(StoreResponses.GetBookmarkedFilesSuccess, (_ipcEvent: any, files: SearchResult[]) => {
      this.bookmarked = [...files]
      setTimeout(() => {
        this.bookmarksInit = true
      }, 300)
    })
  }

  ngOnInit(): void {
    this.state
      .getStatePart('initialized')
      .pipe(take(1))
      .subscribe(() => {
        const bookmarks = this.state.getStatePartValue('bookmarks')
        this.electronService.getBookmarked({ bookmarks })
        this.electronService.getRecentlyModified()
      })
    this.tabs$ = this.state.getStatePart('tabs')
    this.selectedTab$ = this.state.getStatePart('selectedTab').pipe(map((selectedTab) => selectedTab.path))
  }
}
