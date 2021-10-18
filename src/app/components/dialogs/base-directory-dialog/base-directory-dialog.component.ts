import { Component } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { FolderActions } from '../../../../../app/actions'
import { ElectronService } from '../../../core/services'

type IPCEvent = Electron.IpcMessageEvent

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
