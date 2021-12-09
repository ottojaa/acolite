import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Doc } from '../../../../../../app/shared/interfaces'

@Component({
  selector: 'app-file-cards',
  templateUrl: './file-cards.component.html',
  styleUrls: ['./file-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileCardsComponent {
  @Input() files: Doc[]
  @Input() viewInit: boolean
  @Input() title: string
  @Input() showBookmark = false
}
