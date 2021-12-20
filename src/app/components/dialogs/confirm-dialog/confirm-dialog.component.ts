import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ConfirmDialogConfig, TreeElement } from '../../../../../app/shared/interfaces'

@Component({
  selector: 'app-remove-bookmark-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  config: ConfirmDialogConfig = {
    title: 'Are you sure?',
    buttonLabels: {
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string
      content?: string
      fileList?: TreeElement[]
      buttonLabels?: { confirm?: string; cancel?: string }
    }
  ) {
    this.config = { ...this.config, ...this.data }
  }
}
