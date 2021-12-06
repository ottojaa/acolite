import { animate, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { Observable } from 'rxjs'
import { startWith, take } from 'rxjs/operators'
import { StoreResponses } from '../../../../app/actions'
import { FileEntity, Tab } from '../../interfaces/Menu'
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
  forceDashboard$: Observable<boolean>

  recentlyModified: FileEntity[]
  bookmarked: FileEntity[]

  viewInit: boolean = false
  recentlyModifiedInit = false
  bookmarksInit = false
  contrastColor: string

  constructor(private state: StateService, public tabService: TabService, public electronService: ElectronService) {
    this.electronService.on(StoreResponses.GetRecentlyModifiedSuccess, (_ipcEvent: any, files: FileEntity[]) => {
      console.log(files)
      this.recentlyModified = [...files]
      this.recentlyModifiedInit = true
    })
    this.electronService.on(StoreResponses.GetBookmarkedFilesSuccess, (_ipcEvent: any, files: FileEntity[]) => {
      this.bookmarked = [...files]
      this.bookmarksInit = true
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
    this.forceDashboard$ = this.state.getStatePart('forceDashboard')
  }
}
