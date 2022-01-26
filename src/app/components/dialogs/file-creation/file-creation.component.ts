import { Component, Inject, NgZone, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ElectronService } from '../../../core/services'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { MatSelect } from '@angular/material/select'
import { nameValidationPattern } from '../../../../../app/shared/constants'

@Component({
  selector: 'app-file-creation',
  templateUrl: './file-creation.component.html',
  styleUrls: ['./file-creation.component.scss'],
})
export class FileCreationComponent {
  @ViewChild('typeSelect') typeSelect: MatSelect

  fileName = new FormControl('', {
    validators: [Validators.required, Validators.pattern(nameValidationPattern)],
  })

  openFileAfterCreation = true
  showExtensionInput = false
  options = [
    {
      icon: 'text',
      value: 'txt',
      label: 'Text (.txt)',
    },
    {
      icon: 'md',
      value: 'md',
      label: 'Markdown (.md)',
    },
    {
      icon: 'json',
      value: 'json',
      label: 'JSON (.json)',
    },
    {
      icon: 'other',
      value: 'other',
      label: 'Other (specify)',
    },
  ]

  get parent(): string {
    return window.path.getBaseName(this.data.filePath)
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

  getErrorMessage(): string | undefined {
    if (this.fileName.hasError('required')) {
      return 'You must enter a file name'
    }
    if (this.fileName.hasError('pattern')) {
      return 'File name can only contain letters and numbers, and has to have an extension specified'
    }
  }

  onCreateClick(): void {
    const isBanned = this.data.bannedFileNames.some((name) => name === this.fileName.value)
    if (isBanned) {
      this.dialogService.openToast(`${this.fileName.value} already exists in this location`, 'failure')
      return
    }

    const filePath = window.path.getJoinedPath([this.data.filePath, this.fileName.value])

    this.electronService.createNewFileRequest({
      filePath,
      openFileAfterCreation: this.openFileAfterCreation,
      encoding: 'utf-8',
      state: this.state.value,
    })
    this.dialogRef.close()
  }
}
