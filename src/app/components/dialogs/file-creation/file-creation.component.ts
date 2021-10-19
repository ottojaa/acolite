import { Component, Inject, NgZone } from '@angular/core'
import { FormBuilder, FormControl, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { TreeNode } from 'primeng/api'
import { FileActionResponses, FileActions } from '../../../../../app/actions'
import { ElectronService } from '../../../core/services'
import { FileEntity } from '../../../interfaces/Menu'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'

@Component({
  selector: 'app-file-creation',
  templateUrl: './file-creation.component.html',
  styleUrls: ['./file-creation.component.scss'],
})
export class FileCreationComponent {
  fileName = new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚäöüÄÖÜß ]+$')])
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
    return this.getParentNameFromPath()
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
  ) {
    this.electronService.on(
      FileActionResponses.CreateSuccess,
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
    const path = `${this.data}/${this.result}`
    const { menuItems } = this.state.state$.value
    this.electronService.createNewFileRequest(FileActions.Create, { data: { path, menuItems } })
  }

  getParentNameFromPath(): string {
    const filePath = this.data
    const lastIdx = filePath.lastIndexOf('/')
    return filePath.substring(lastIdx + 1, filePath.length)
  }
}
