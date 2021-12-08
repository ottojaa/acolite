import { Component, Input, OnInit } from '@angular/core'
import { TabService } from 'app/services/tab.service'
import { fileExtensionIcons } from '../../../../../../app/shared/constants'
import { SearchResult } from '../../../../../../app/shared/interfaces'

@Component({
  selector: 'app-file-card',
  templateUrl: './file-card.component.html',
  styleUrls: ['./file-card.component.scss'],
})
export class FileCardComponent {
  @Input() file: SearchResult

  constructor(private tabService: TabService) {}

  openInNewTab(file: SearchResult): void {
    this.tabService.openNewTab(file.filePath)
  }
}
