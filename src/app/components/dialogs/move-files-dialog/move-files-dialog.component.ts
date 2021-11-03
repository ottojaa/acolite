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
  selector: 'app-move-files-dialog',
  templateUrl: './move-files-dialog.component.html',
  styleUrls: ['./move-files-dialog.component.scss'],
})
export class MoveFilesDialogComponent implements OnInit {
  toMoveCount: number
  moveText: string
  displayTexts: { folders: string[]; files: string[] }
  constructor(
    public dialogRef: MatDialogRef<RenameFileDialogComponent>,
    public electronService: ElectronService,
    public dialogService: AppDialogService,
    public state: StateService,
    public ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: { selectedFiles: TreeElement[]; target: TreeElement }
  ) {}

  ngOnInit(): void {
    this.displayTexts = this.getDisplayTexts()
  }

  getDisplayTexts(): any {
    const { selectedFiles, target } = this.data
    const folders = selectedFiles.filter((el) => el.data.type === 'folder')
    const folderPaths = folders.map((folder) => folder.data.filePath)
    const files = selectedFiles.filter(
      (el) => el.data.type === 'file' && !folderPaths.some((path) => path.includes(el.data.parentPath))
    )
    this.toMoveCount = folders.length + files.length
    this.moveText = this.getMoveText(folders, files, target)

    return {
      folders: [...folders.map((folder) => getBaseName(folder.data.filePath))],
      files: files.map((file) => getBaseName(file.data.filePath)),
    }
  }

  getMoveText(folders: TreeElement[], files: TreeElement[], target: TreeElement): string {
    const hasFolders = folders.length
    const hasFiles = files.length
    if (this.toMoveCount === 1) {
      if (hasFiles) {
        return `file to ${target.label}?`
      }
      return `folder and its contents to ${target.label}?`
    } else {
      if (hasFiles && hasFolders) {
        return `files/folders and their contents ${target.label}?`
      } else if (hasFolders && !hasFiles) {
        return `folders and their contents to ${target.label}?`
      } else if (hasFiles && !hasFolders) {
        return `files to ${target.label}?`
      }
    }
  }

  onMoveClick(): void {
    const { selectedFiles, target } = this.data
    const baseDir = this.state.getStatePartValue('baseDir')
    const menuItems = this.state.getStatePartValue('menuItems')
    const filePaths = selectedFiles.map((file) => file.data.filePath)
    const filesToBeMoved = selectedFiles.filter(
      (file) => !filePaths.some((path) => path.includes(file.data.filePath) && path !== file.data.filePath)
    )

    this.electronService.moveFilesRequest(FileActions.MoveFiles, {
      data: {
        menuItems,
        target,
        baseDir,
        elementsToMove: filesToBeMoved,
      },
    })
    this.dialogRef.close()
  }
}
