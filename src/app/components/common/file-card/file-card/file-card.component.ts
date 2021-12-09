import { Component, Input, NgZone, OnInit } from '@angular/core'
import { AppDialogService } from 'app/services/dialog.service'
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
  @Input() showBookmark: boolean

  constructor(private tabService: TabService, private dialogService: AppDialogService, private zone: NgZone) {}

  openInNewTab(file: SearchResult): void {
    this.tabService.openNewTab(file.filePath)
  }

  confirmRemoveBookmark(path: string): void {
    this.zone.run(() => {
      this.dialogService.openConfirmDialog('Remove bookmark?').subscribe((data) => {
        if (data) {
          this.tabService.removeBookmark(path)
        }
      })
    })
  }
}
