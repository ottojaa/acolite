import { Component, Inject, NgZone, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ElectronService } from '../../../core/services'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { MatSelect } from '@angular/material/select'
import { extensionValidationPattern, nameValidationPattern } from '../../../../../app/shared/constants'
import { getBaseName, getJoinedPath } from '../../../../../app/electron-utils/file-utils'
import { TreeElement } from '../../../../../app/shared/interfaces'

@Component({
  selector: 'app-file-creation',
  templateUrl: './file-creation.component.html',
  styleUrls: ['./file-creation.component.scss'],
})
export class FileCreationComponent {
  @ViewChild('typeSelect') typeSelect: MatSelect

  fileName = new FormControl('', [Validators.required, Validators.pattern(nameValidationPattern)])
  extension = new FormControl('txt', [Validators.required, Validators.pattern(extensionValidationPattern)])
  openFileAfterCreation = true
  showExtensionInput = false
  options = [
    {
      icon: 'text',
      value: 'txt',
      label: 'Text (txt)',
    },
    {
      icon: 'md',
      value: 'md',
      label: 'Markdown (md)',
    },
    {
      icon: 'json',
      value: 'json',
      label: 'JSON (json)',
    },
    {
      icon: 'other',
      value: 'other',
      label: 'Other (manual input)',
    },
  ]

  get result(): string {
    const name = this.fileName.value
    const extension = this.extension.value
    if (!name || !extension) {
      return
    }
    return name + '.' + extension
  }

  get parent(): string {
    return getBaseName(this.data.filePath)
  }

  get formValid(): boolean {
    return this.fileName.valid && this.fileName.valid
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { filePath: string; bannedFileNames: string[] },
    public dialogRef: MatDialogRef<FileCreationComponent>,
    public electronService: ElectronService,
    public dialogService: AppDialogService,
    public state: StateService,
    public ngZone: NgZone,
    public fb: FormBuilder
  ) {}

  onNoClick(): void {
    this.dialogRef.close()
  }

  onClickOtherOption(): void {
    this.showExtensionInput
  }

  getErrorMessage(): string | undefined {
    if (this.fileName.hasError('required')) {
      return 'You must enter a file name'
    }
    if (this.fileName.hasError('pattern')) {
      return 'File name can only contain letters and numbers'
    }
    if (this.extension.hasError('required')) {
      return 'You must choose an extension'
    }
    if (this.extension.hasError('pattern')) {
      return 'Extension can only consist of lower-case letters'
    }
  }

  onCreateClick(): void {
    const isBanned = this.data.bannedFileNames.some((name) => name === this.result)
    if (isBanned) {
      this.dialogService.openToast(`${this.result} already exists in this location`, 'failure')
      return
    }

    const filePath = getJoinedPath([this.data.filePath, this.result])

    this.electronService.createNewFileRequest({
      filePath,
      openFileAfterCreation: this.openFileAfterCreation,
      state: this.state.value,
    })
    this.dialogRef.close()
  }
}
