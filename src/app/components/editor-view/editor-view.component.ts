import { Component, OnInit } from '@angular/core'
import { AbstractComponent } from 'app/abstract/abstract-component'
import { ElectronService } from 'app/core/services'
import { flatMap } from 'lodash'
import { BehaviorSubject, combineLatest, forkJoin, from, Observable, of, Subject } from 'rxjs'
import { filter, map, mergeMap, skipUntil, switchMap, take, takeUntil, tap } from 'rxjs/operators'
import { Doc } from '../../../../app/shared/interfaces'
import { StateService } from '../../services/state.service'
import { TabService } from '../../services/tab.service'

@Component({
  selector: 'app-editor-view',
  templateUrl: './editor-view.component.html',
  styleUrls: ['./editor-view.component.scss'],
})
export class EditorViewComponent extends AbstractComponent implements OnInit {
  tabs$: Observable<Doc[]>
  forceDashboard$: Observable<boolean>
  recentlyModified$: Observable<Doc[]>
  indexingReady$: Observable<boolean>
  bookmarked$: Observable<Doc[]>
  basePath$: Observable<string>
  bannerOpen = true
  viewInit$: Observable<boolean>

  markedForUpdate = {
    recentlyModified: false,
    bookmarked: false,
  }

  private recentlyModifiedSub$ = new BehaviorSubject<Doc[]>([])
  private bookmarkedSub$ = new BehaviorSubject<Doc[]>([])

  constructor(private state: StateService, public tabService: TabService, public electronService: ElectronService) {
    super()
  }

  ngOnInit(): void {
    this.basePath$ = this.state.getStatePart('baseDir')
    this.indexingReady$ = this.state.getStatePart('indexingReady')
    this.tabs$ = this.state.getStatePart('tabs')
    this.recentlyModified$ = this.getRecentlyModified()
    this.bookmarked$ = this.getBookmarked()
    this.forceDashboard$ = this.state.getStatePart('selectedTab').pipe(map((selectedTab) => selectedTab.forceDashboard))

    this.waitForIndexingReadyUntilInitContent()
    this.initBookmarksListener()
    this.initRecentlyModifiedListener()
  }

  /**
   * Wait for the main process to send event indicating that all files are indexed and then initialise bookmarks and recently modified
   */
  waitForIndexingReadyUntilInitContent(): void {
    this.indexingReady$
      .pipe(
        filter((indexingReady) => indexingReady),
        take(1),
        switchMap(async () => {
          const bookmarks = this.state.getStatePartValue('bookmarks')
          const recentlyModified$ = await this.fetchRecentlyModified()
          const bookmarked$ = await this.fetchBookmarked(bookmarks)

          return forkJoin([recentlyModified$, bookmarked$])
        }),
        mergeMap((data) => data)
      )
      .subscribe(([recentlyModified, bookmarked]) => {
        this.recentlyModifiedSub$.next(recentlyModified)
        this.bookmarkedSub$.next(bookmarked)
      })
  }

  initBookmarksListener(): void {
    this.state
      .getStatePart('bookmarks')
      .pipe(
        takeUntil(this.destroy$),
        switchMap((bookmarks) => this.fetchBookmarked(bookmarks)),
        mergeMap((data) => data)
      )
      .subscribe((bookmarked) => {
        this.bookmarkedSub$.next(bookmarked)
      })
  }

  initRecentlyModifiedListener(): void {
    this.state
      .getStatePart('indexing')
      .pipe(
        takeUntil(this.destroy$),
        skipUntil(this.indexingReady$),
        filter((isIndexing) => !isIndexing),
        switchMap(() => this.fetchRecentlyModified()),
        mergeMap((data) => data)
      )
      .subscribe((recentlyModified) => {
        this.recentlyModifiedSub$.next(recentlyModified)
      })
  }

  onClickBanner(): void {
    this.tabService.toggleForceDashboard()
  }

  getRecentlyModified(): Observable<Doc[]> {
    return this.recentlyModifiedSub$.asObservable()
  }

  getBookmarked(): Observable<Doc[]> {
    return this.bookmarkedSub$.asObservable()
  }

  async fetchRecentlyModified(): Promise<Observable<Doc[]>> {
    return of(await this.electronService.getRecentlyModified())
  }

  async fetchBookmarked(bookmarks: string[]): Promise<Observable<Doc[]>> {
    return of(await this.electronService.getBookmarkedFiles({ bookmarks }))
  }
}
