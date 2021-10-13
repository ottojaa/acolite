import { Component, Inject, NgZone, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { cloneDeep } from 'lodash'
import { TreeNode } from 'primeng/api'
import { ElectronService } from '../../../core/services'
import { FileActionResponses, FileActions } from '../../../entities/file/constants'
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
    this.electronService.on(FileActionResponses.CreateSuccess, (_event: Electron.IpcMessageEvent, file: FileEntity) => {
      this.updateMenuItems(file)
      this.ngZone.run(() => {
        this.dialogRef.close()
      })
    })
    this.electronService.on(FileActionResponses.CreateFailure, (_event: Electron.IpcMessageEvent, args: any) => {
      this.dialogService.openToast('File creation failed', 'failure')
    })
  }

  onNoClick(): void {
    this.dialogRef.close()
  }

  onCreateClick(): void {
    const filePath = `${this.data}/${this.fileName}.${this.extension}`
    this.electronService.send(FileActions.Create, filePath)
  }

  updateMenuItems(file: FileEntity): void {
    const { baseDir, menuItems } = this.state.state$.value

    const updateState = (payload: TreeNode<FileEntity>[]) => {
      this.state.updateState$.next({ key: 'menuItems', payload })
    }
    if (file.parentPath === baseDir) {
      const updatedMenuItems = addFileToBaseDir(menuItems, file)
      updateState(updatedMenuItems)
    } else {
      const updatedMenuItems = getUpdatedMenuItemsRecursive(menuItems, file)
      updateState(updatedMenuItems)
    }
  }
}
