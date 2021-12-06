import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { FileEntity, SearchResult } from 'app/interfaces/Menu'

@Component({
  selector: 'app-file-cards',
  templateUrl: './file-cards.component.html',
  styleUrls: ['./file-cards.component.scss'],
})
export class FileCardsComponent {
  @Input() files: SearchResult[]
  @Input() viewInit: boolean
  @Input() title: string
}
