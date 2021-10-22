import { Component, Inject, NgZone, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { FileActionResponses, FileActions } from '../../../../../app/actions'
import { ElectronService } from '../../../core/services'
import { TreeElement } from '../../../interfaces/Menu'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { getBaseName } from '../../../utils/file-utils'
import { RenameFileDialogComponent } from '../rename-file-dialog/rename-file-dialog.component'

@Component({
  selector: 'app-delete-files-dialog',
  templateUrl: './delete-files-dialog.component.html',
  styleUrls: ['./delete-files-dialog.component.scss'],
})
export class DeleteFilesDialogComponent {
  toDeleteCount: number
  deleteText: string
  displayTexts: { folders: string[]; files: string[] }
  constructor(
    public dialogRef: MatDialogRef<RenameFileDialogComponent>,
    public electronService: ElectronService,
    public dialogService: AppDialogService,
    public state: StateService,
    public ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: TreeElement[]
  ) {
    this.displayTexts = this.getDisplayTexts()

    // Electron
    this.electronService.on(
      FileActionResponses.DeleteSuccess,
      (_event: Electron.IpcMessageEvent, updatedMenuItems: TreeElement[]) => {
        this.state.updateState$.next({ key: 'menuItems', payload: updatedMenuItems })
        this.dialogService.openToast('Delete success', 'success')
        this.ngZone.run(() => {
          this.dialogRef.close()
        })
      }
    )
    this.electronService.on(FileActionResponses.DeleteFailure, (_event: Electron.IpcMessageEvent, args: any) => {
      this.dialogService.openToast('Something went wrong while deleting', 'failure')
    })
    this.electronService.on(
      FileActionResponses.DeletePartialSuccess,
      (_event: Electron.IpcMessageEvent, updatedMenuItems: TreeElement[], message: string) => {
        this.state.updateState$.next({ key: 'menuItems', payload: updatedMenuItems })
        this.dialogService.openToast(message, 'info')
      }
    )
  }

  getDisplayTexts(): any {
    const folders = this.data.filter((el) => el.data.type === 'folder')
    const folderPaths = folders.map((folder) => folder.data.filePath)
    const files = this.data.filter((el) => el.data.type === 'file' && !folderPaths.includes(el.data.parentPath))
    this.toDeleteCount = folders.length + files.length
    this.deleteText = this.getDeleteText(folders, files)

    return {
      folders: [...folders.map((folder) => getBaseName(folder.data.filePath))],
      files: files.map((file) => getBaseName(file.data.filePath)),
    }
  }

  getDeleteText(folders: TreeElement[], files: TreeElement[]): string {
    const hasFolders = folders.length
    const hasFiles = files.length
    if (this.toDeleteCount === 1) {
      if (hasFiles) {
        return 'file?'
      }
      return 'folder and its contents?'
    } else {
      if (hasFiles && hasFolders) {
        return 'files/folders and their contents?'
      } else if (hasFolders && !hasFiles) {
        return 'folders and their contents?'
      } else if (hasFiles && !hasFolders) {
        return 'files?'
      }
    }
  }

  onDeleteClick(): void {
    const baseDir = this.state.getStatePartValue('baseDir')
    const menuItems = this.state.getStatePartValue('menuItems')
    this.electronService.deleteFilesRequest(FileActions.DeleteFiles, {
      data: {
        baseDir,
        menuItems,
        directoryPaths: this.data.filter((el) => el.data.type === 'folder').map((el) => el.data.filePath),
        filePaths: this.data.filter((el) => el.data.type === 'file').map((el) => el.data.filePath),
      },
    })
  }
}
