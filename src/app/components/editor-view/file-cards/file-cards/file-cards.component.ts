import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { SearchResult } from 'app/interfaces/Menu'

@Component({
  selector: 'app-file-cards',
  templateUrl: './file-cards.component.html',
  styleUrls: ['./file-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileCardsComponent {
  @Input() files: SearchResult[]
  @Input() viewInit: boolean
  @Input() title: string
}
