import { Component, HostListener, Inject, NgZone, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ElectronService } from '../../../core/services'
import { nameValidationPattern } from '../../../entities/file/constants'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { getBaseName, getJoinedPath } from '../../../utils/file-utils'
import { MatSelect } from '@angular/material/select'

@Component({
  selector: 'app-file-creation',
  templateUrl: './file-creation.component.html',
  styleUrls: ['./file-creation.component.scss'],
})
export class FileCreationComponent {
  @ViewChild('typeSelect') typeSelect: MatSelect
  @HostListener('window:keyup.Enter', ['$event'])
  onEnter(_event: KeyboardEvent): void {
    if (this.fileName.invalid || this.extension.invalid || document.activeElement.tagName === 'MAT-SELECT') {
      return
    }
    this.onCreateClick()
  }

  fileName = new FormControl('', [Validators.required, Validators.pattern(nameValidationPattern)])
  extension = new FormControl('txt', [Validators.required])
  openFileAfterCreation = true
  options = [
    {
      icon: 'text',
      value: 'txt',
      label: 'Text',
    },
    {
      icon: 'md',
      value: 'md',
      label: 'Markdown',
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
    return getBaseName(this.data)
  }

  get formValid(): boolean {
    return this.fileName.valid && this.fileName.valid
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
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
      return 'File name can only contain letters and numbers'
    }
    if (this.extension.hasError('required')) {
      return 'You must choose an extension'
    }
  }

  onCreateClick(): void {
    const path = getJoinedPath([this.data, this.result])
    const { rootDirectory } = this.state.state$.value

    this.electronService.createNewFileRequest({
      path,
      rootDirectory,
      openFileAfterCreation: this.openFileAfterCreation,
    })
    this.dialogRef.close()
  }
}
