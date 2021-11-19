import { Component, Inject, NgZone, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { FileActionResponses, FileActions } from '../../../../../app/actions'
import { ElectronService } from '../../../core/services'
import { FilePathContainer } from '../../../interfaces/File'
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
    @Inject(MAT_DIALOG_DATA) public data: FilePathContainer
  ) {
    this.displayTexts = this.getDisplayTexts()
  }

  getDisplayTexts(): FilePathContainer {
    const { folders, files } = this.data
    this.toDeleteCount = folders.length + files.length
    this.deleteText = this.getDeleteText(folders, files)

    return {
      folders: [...folders.map((folder) => getBaseName(folder))],
      files: files.map((file) => getBaseName(file)),
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
    const { baseDir, rootDirectory, tabs } = this.state.getStateParts(['baseDir', 'rootDirectory', 'tabs'])

    this.electronService.deleteFilesRequest({
      baseDir,
      rootDirectory,
      directoryPaths: this.data.folders,
      filePaths: this.data.files,
      tabs,
    })
    this.dialogRef.close()
  }
}
