import { Component, Inject, NgZone } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { fileNameValidationPattern } from '../../../../../app/shared/constants'
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
  fileName: FormControl

  constructor(
    public dialogRef: MatDialogRef<RenameFileDialogComponent>,
    public electronService: ElectronService,
    public dialogService: AppDialogService,
    public state: StateService,
    public ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: { filePath: string; bannedFileNames: string[] }
  ) {
    this.fileName = new FormControl(window.path.getBaseName(data.filePath), [
      Validators.required,
      Validators.pattern(fileNameValidationPattern),
    ])
  }

  onCancelClick(): void {
    this.dialogRef.close()
  }

  getErrorMessage(): string | undefined {
    if (this.fileName.hasError('required')) {
      return 'You must enter a file name'
    }
    if (this.fileName.hasError('pattern')) {
      return 'Name can only contain letters and numbers and has to have an extension specified'
    }
  }

  onRenameClick(): void {
    const isBanned = this.data.bannedFileNames.some((name) => {
      const [baseName] = name.split('.')
      return baseName === this.fileName.value
    })

    if (isBanned) {
      const msg = `${this.fileName.value}`
      this.dialogService.openToast(`${msg} already exists in this location`, 'failure')
      return
    }

    console.log(this.fileName.value)
    this.electronService.renameFileRequest({
      filePath: this.data.filePath,
      newName: this.fileName.value,
      state: this.state.value,
    })
    this.dialogRef.close()
  }
}
