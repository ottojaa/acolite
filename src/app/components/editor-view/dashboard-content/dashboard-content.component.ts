import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'
import { Doc } from '../../../../../app/shared/interfaces'

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.scss'],
})
export class DashboardContentComponent {
  @Input() recentlyModified: Doc[]
  @Input() bookmarks: Doc[]
  @Input() basePath: string

  recentlyModifiedLayout: 'card' | 'table' = 'card'
  bookmarksLayout: 'card' | 'table' = 'card'

  onClickLayoutIcon(): void {}
}
