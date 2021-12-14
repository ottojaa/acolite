import { Component, OnInit } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { combineLatest, Observable } from 'rxjs'
import { delay, map, take, tap } from 'rxjs/operators'
import { Tab, SearchResult, Doc } from '../../../../app/shared/interfaces'
import { StateService } from '../../services/state.service'
import { TabService } from '../../services/tab.service'

@Component({
  selector: 'app-editor-view',
  templateUrl: './editor-view.component.html',
  styleUrls: ['./editor-view.component.scss'],
})
export class EditorViewComponent implements OnInit {
  tabs$: Observable<Tab[]>
  forceDashboard$: Observable<boolean>
  recentlyModified$: Observable<Doc[]>
  bookmarked$: Observable<Doc[]>
  basePath$: Observable<string>
  bannerOpen = true
  viewInit = false

  constructor(private state: StateService, public tabService: TabService, public electronService: ElectronService) {}

  ngOnInit(): void {
    this.basePath$ = this.state.getStatePart('baseDir')
    this.tabs$ = this.state.getStatePart('tabs')
    this.bookmarked$ = this.state.getStatePart('bookmarkedFiles')
    this.recentlyModified$ = this.state.getStatePart('recentlyModified')
    this.forceDashboard$ = this.state.getStatePart('selectedTab').pipe(
      map((selectedTab) => selectedTab.forceDashboard),
      tap((data) => console.log(data))
    )

    combineLatest([this.recentlyModified$, this.bookmarked$])
      .pipe(take(1), delay(400))
      .subscribe(() => (this.viewInit = true))
  }

  onClickBanner(): void {
    this.tabService.toggleForceDashboard()
  }
}
