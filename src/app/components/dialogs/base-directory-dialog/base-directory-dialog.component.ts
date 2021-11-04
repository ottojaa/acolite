import { Component } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { ElectronService } from '../../../core/services'

@Component({
  selector: 'app-base-directory-dialog',
  templateUrl: './base-directory-dialog.component.html',
  styleUrls: ['./base-directory-dialog.component.scss'],
})
export class BaseDirectoryDialogComponent {
  constructor(public dialogRef: MatDialogRef<BaseDirectoryDialogComponent>, private electronService: ElectronService) {}

  onChooseDirectory(): void {
    this.electronService.chooseDirectory()
  }

  onSetDefaultDirectory(): void {
    this.electronService.setDefaultDir()
  }

  closeDialog(): void {}
}
