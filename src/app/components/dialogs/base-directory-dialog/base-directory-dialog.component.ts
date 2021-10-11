import { Component, OnInit } from '@angular/core'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { ElectronService } from '../../../core/services'
import { FolderActionResponses, FolderActions } from '../../../entities/folder/constants'

type IPCEvent = Electron.IpcMessageEvent

@Component({
  selector: 'app-base-directory-dialog',
  templateUrl: './base-directory-dialog.component.html',
  styleUrls: ['./base-directory-dialog.component.scss'],
})
export class BaseDirectoryDialogComponent {
  constructor(public dialogRef: MatDialogRef<BaseDirectoryDialogComponent>, private electronService: ElectronService) {}

  onChooseDirectory(): void {
    this.electronService.send(FolderActions.ChooseDir)
  }

  onSetDefaultDirectory(): void {
    this.electronService.send(FolderActions.SetDefaultDir)
  }

  closeDialog(): void {}
}
