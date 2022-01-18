import { animate, animateChild, keyframes, query, stagger, style, transition, trigger } from '@angular/animations'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core'
import { Doc } from '../../../../../../../app/shared/interfaces'

@Component({
  selector: 'app-file-cards',
  templateUrl: './file-cards.component.html',
  styleUrls: ['./file-cards.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('cardAnimation', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), { optional: true }),
        query(
          ':enter',
          stagger('20ms', [
            animate(
              '.3s ease-in',
              keyframes([
                style({ opacity: 0, transform: 'translateX(-10%)', offset: 0 }),
                style({ opacity: 0.5, transform: 'translateX(-5px)', offset: 0.3 }),
                style({ opacity: 1, transform: 'translateY(0)', offset: 1 }),
              ])
            ),
          ]),
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class FileCardsComponent {
  @Input() files: Doc[]
  @Input() showBookmark = false

  trackByPath(_index: number, tab: Doc): string {
    return tab.filePath
  }
}
