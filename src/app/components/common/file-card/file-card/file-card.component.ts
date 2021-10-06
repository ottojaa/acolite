import { Component, Input } from '@angular/core'
import { FileEntity } from '../../../../interfaces/File'

@Component({
  selector: 'app-file-card',
  templateUrl: './file-card.component.html',
  styleUrls: ['./file-card.component.scss'],
})
export class FileCardComponent {
  @Input() file: FileEntity
}
