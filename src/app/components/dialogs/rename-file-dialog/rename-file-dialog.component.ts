import { Component, Inject, NgZone, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { TreeNode } from 'primeng/api'
import { FileActionResponses, FileActions } from '../../../../../app/actions'
import { ElectronService } from '../../../core/services'
import { nameValidationPattern } from '../../../entities/file/constants'
import { FileEntity } from '../../../interfaces/Menu'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { getBaseName, getDirName } from '../../../utils/file-utils'

@Component({
  selector: 'app-rename-file-dialog',
  templateUrl: './rename-file-dialog.component.html',
  styleUrls: ['./rename-file-dialog.component.scss'],
})
export class RenameFileDialogComponent {
  extension: string
  fileName = new FormControl('', [Validators.required, Validators.pattern(nameValidationPattern)])

  constructor(
    public dialogRef: MatDialogRef<RenameFileDialogComponent>,
    public electronService: ElectronService,
    public dialogService: AppDialogService,
    public state: StateService,
    public ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    this.initFileNameAndExtension(data)

    this.electronService.on(
      FileActionResponses.RenameSuccess,
      (_event: Electron.IpcMessageEvent, updatedMenuItems: TreeNode<FileEntity>[]) => {
        this.state.updateState$.next({ key: 'menuItems', payload: updatedMenuItems })
        this.ngZone.run(() => {
          this.dialogRef.close()
        })
      }
    )
    this.electronService.on(FileActionResponses.CreateFailure, (_event: Electron.IpcMessageEvent, args: any) => {
      this.dialogService.openToast('File creation failed', 'failure')
    })
  }

  onCancelClick(): void {
    this.dialogRef.close()
  }

  getErrorMessage(): string | undefined {
    if (this.fileName.hasError('required')) {
      return 'You must enter a file name'
    }
    if (this.fileName.hasError('pattern')) {
      return 'Name can only contain letters and numbers'
    }
  }

  initFileNameAndExtension(filePath: string): void {
    const [fileName, extension] = getBaseName(filePath).split('.')
    this.fileName.setValue(fileName)
    this.extension = extension
  }

  onRenameClick(): void {
    const { menuItems } = this.state.state$.value
    const oldPathParent = getDirName(this.data)
    const oldPath = this.data
    const isFile = !!this.extension
    const newPath = isFile
      ? `${oldPathParent}${this.fileName.value}.${this.extension}`
      : `${oldPathParent}${this.fileName.value}`

    this.electronService.renameFileRequest(FileActions.Rename, {
      data: { oldPath, newPath, isFolder: !isFile, menuItems },
    })
    this.dialogRef.close()
  }
}
