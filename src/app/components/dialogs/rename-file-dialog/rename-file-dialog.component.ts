import { Component, Inject, NgZone } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { getBaseName } from '../../../../../app/electron-utils/file-utils'
import { nameValidationPattern } from '../../../../../app/shared/constants'
import { ElectronService } from '../../../core/services'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'

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
    this.electronService.renameFileRequest({ path: this.data, newName: this.fileName.value, state: this.state.value })
    this.dialogRef.close()
  }
}
