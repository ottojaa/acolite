import { Component, Inject, NgZone, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { cloneDeep } from 'lodash'
import { TreeNode } from 'primeng/api'
import { FileActionResponses, FileActions } from '../../../../../app/actions'
import { ElectronService } from '../../../core/services'
import { FileEntity } from '../../../interfaces/Menu'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { addFileToBaseDir, getUpdatedMenuItemsRecursive } from '../../../utils/menu-utils'

@Component({
  selector: 'app-file-creation',
  templateUrl: './file-creation.component.html',
  styleUrls: ['./file-creation.component.scss'],
})
export class FileCreationComponent {
  fileName: string
  openFileAfterCreation = true
  extension: 'txt' | 'md'
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
    if (!this.fileName || !this.extension) {
      return
    }
    return this.fileName + '.' + this.extension
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { filePath: string },
    public dialogRef: MatDialogRef<FileCreationComponent>,
    public electronService: ElectronService,
    public dialogService: AppDialogService,
    public state: StateService,
    public ngZone: NgZone
  ) {
    this.electronService.on(
      FileActionResponses.CreateSuccess,
      (_event: Electron.IpcMessageEvent, updatedMenuItems: TreeNode<FileEntity>[]) => {
        this.updateMenuItems(updatedMenuItems)
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

  onCreateClick(): void {
    const path = `${this.data}/${this.fileName}.${this.extension}`
    const { menuItems } = this.state.state$.value
    this.electronService.createNewFileRequest(FileActions.Create, { data: { path, menuItems } })
  }

  updateMenuItems(updatedMenuItems: TreeNode<FileEntity>[]): void {
    this.state.updateState$.next({ key: 'menuItems', payload: updatedMenuItems })
  }
}
