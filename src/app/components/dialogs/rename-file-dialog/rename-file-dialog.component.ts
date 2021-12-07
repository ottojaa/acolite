import { Component, HostListener, Inject, NgZone } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { FileActions } from '../../../../../app/actions'
import { ElectronService } from '../../../core/services'
import { nameValidationPattern } from '../../../entities/file/constants'
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

  /* @HostListener('window:keyup.Enter', ['$event'])
  onEnter(_event: KeyboardEvent): void {
    if (this.fileName.invalid) {
      return
    }
    this.onRenameClick()
  } */

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
    const { rootDirectory, tabs } = this.state.getStateParts(['rootDirectory', 'tabs'])
    this.electronService.renameFileRequest({ path: this.data, tabs, newName: this.fileName.value, rootDirectory })
    this.dialogRef.close()
  }
}
