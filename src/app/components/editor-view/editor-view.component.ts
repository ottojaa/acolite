import { Component, OnInit } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { combineLatest, Observable } from 'rxjs'
import { delay, map, take } from 'rxjs/operators'
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
  selectedTab$: Observable<string>
  recentlyModified$: Observable<Doc[]>
  bookmarked$: Observable<Doc[]>

  viewInit = false
  contrastColor: string

  constructor(private state: StateService, public tabService: TabService, public electronService: ElectronService) {}

  ngOnInit(): void {
    this.tabs$ = this.state.getStatePart('tabs')
    this.bookmarked$ = this.state.getStatePart('bookmarkedFiles')
    this.recentlyModified$ = this.state.getStatePart('recentlyModified')
    this.selectedTab$ = this.state.getStatePart('selectedTab').pipe(map((selectedTab) => selectedTab.path))

    combineLatest([this.recentlyModified$, this.bookmarked$])
      .pipe(take(1), delay(1000))
      .subscribe(() => (this.viewInit = true))
  }
}
