import { Component, Inject, NgZone } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { FilePathContainer } from '../../../../../app/shared/interfaces'
import { ElectronService } from '../../../core/services'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { RenameFileDialogComponent } from '../rename-file-dialog/rename-file-dialog.component'

@Component({
  selector: 'app-delete-files-dialog',
  templateUrl: './delete-files-dialog.component.html',
  styleUrls: ['./delete-files-dialog.component.scss'],
})
export class DeleteFilesDialogComponent {
  toDeleteCount: number
  deleteText: string
  displayTexts: { folders: string[]; files: { name: string; extension: string }[] }

  constructor(
    public dialogRef: MatDialogRef<RenameFileDialogComponent>,
    public electronService: ElectronService,
    public dialogService: AppDialogService,
    public state: StateService,
    public ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: FilePathContainer
  ) {
    this.displayTexts = this.getDisplayTexts()
  }

  getDisplayTexts(): { folders: string[]; files: { name: string; extension: string }[] } {
    const { folders, files } = this.data
    this.toDeleteCount = folders.length + files.length
    this.deleteText = this.getDeleteText(folders, files)

    const getName = (filePath: string) => {
      return window.path.getBaseName(filePath)
    }

    return {
      folders: [...folders.map((folder) => getName(folder))],
      files: files.map((file) => ({ name: getName(file), extension: window.path.getExtension(file) })),
    }
  }

  getDeleteText(folders: string[], files: string[]): string {
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
    this.electronService.deleteFilesRequest({
      directoryPaths: this.data.folders,
      filePaths: this.data.files,
      state: this.state.value,
    })
    this.dialogRef.close()
  }
}
