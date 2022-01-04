import { Component, Inject, NgZone, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { getBaseName, getExtension } from '../../../../../app/electron-utils/file-utils'
import { FilePathContainer, TreeElement } from '../../../../../app/shared/interfaces'
import { ElectronService } from '../../../core/services'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { RenameFileDialogComponent } from '../rename-file-dialog/rename-file-dialog.component'

@Component({
  selector: 'app-move-files-dialog',
  templateUrl: './move-files-dialog.component.html',
  styleUrls: ['./move-files-dialog.component.scss'],
})
export class MoveFilesDialogComponent implements OnInit {
  toMoveCount: number
  moveText: string
  displayTexts: any
  pathsToBeMoved: FilePathContainer = { folders: [], files: [] }

  constructor(
    public dialogRef: MatDialogRef<RenameFileDialogComponent>,
    public electronService: ElectronService,
    public dialogService: AppDialogService,
    public state: StateService,
    public ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA)
    public data: { pathContainer: FilePathContainer; selectedFiles: TreeElement[]; target: TreeElement }
  ) {}

  ngOnInit(): void {
    this.displayTexts = this.getDisplayTexts()
  }

  getDisplayTexts(): any {
    const { pathContainer, target } = this.data
    const { folders, files } = pathContainer
    this.pathsToBeMoved = pathContainer

    this.toMoveCount = folders.length + files.length
    this.moveText = this.getMoveText(folders, files, target)

    return {
      folders: [...folders.map((path) => ({ name: getBaseName(path), extension: getExtension(path) }))],
      files: files.map((path) => ({ name: getBaseName(path), extension: getExtension(path) })),
    }
  }

  getMoveText(folders: string[], files: string[], target: TreeElement): string {
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
    const paths = Object.values(this.pathsToBeMoved).reduce((acc, curr) => acc.concat(curr), [])
    const filesToBeMoved = selectedFiles.filter((el) => paths.includes(el.data.filePath))

    this.electronService.moveFilesRequest({
      target,
      elementsToMove: filesToBeMoved,
      state: this.state.value,
    })
    this.dialogRef.close()
  }
}
