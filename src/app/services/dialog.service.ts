import { Injectable, NgZone } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'
import { BaseDirectoryDialogComponent } from '../components/dialogs/base-directory-dialog/base-directory-dialog.component'
import { ChangeDirectoryDialogComponent } from '../components/dialogs/change-directory-dialog/change-directory-dialog.component'
import { DeleteFilesDialogComponent } from '../components/dialogs/delete-files-dialog/delete-files-dialog.component'
import { FileCreationComponent } from '../components/dialogs/file-creation/file-creation.component'
import { FolderCreationDialogComponent } from '../components/dialogs/folder-creation-dialog/folder-name-dialog/folder-creation-dialog.component'
import { MoveFilesDialogComponent } from '../components/dialogs/move-files-dialog/move-files-dialog.component'
import { RenameFileDialogComponent } from '../components/dialogs/rename-file-dialog/rename-file-dialog.component'
import { FilePathContainer } from '../interfaces/File'
import { TreeElement } from '../interfaces/Menu'

@Injectable({
  providedIn: 'root',
})
export class AppDialogService {
  constructor(public dialog: MatDialog, private _snackBar: MatSnackBar, public zone: NgZone) {}

  openWorkspaceDirectoryDialog(): Observable<string | undefined> {
    const ref = this.dialog.open(BaseDirectoryDialogComponent, { hasBackdrop: true })
    return ref.afterClosed().pipe(take(1))
  }

  openChangeWorkspaceDialog(): Observable<undefined> {
    const ref = this.dialog.open(ChangeDirectoryDialogComponent, { hasBackdrop: true })
    return ref.afterClosed().pipe(take(1))
  }

  openFolderNameDialog(filePath: string): Observable<string | undefined> {
    const ref = this.dialog.open(FolderCreationDialogComponent, { data: filePath, hasBackdrop: true })
    return ref.afterClosed().pipe(take(1))
  }

  openNewFileCreationDialog(filePath: string): Observable<{ extension: 'txt' | 'md'; fileName: string }> {
    const ref = this.dialog.open(FileCreationComponent, {
      data: filePath,
      minWidth: '400px',
      maxWidth: '600px',
      hasBackdrop: true,
    })
    return ref.afterClosed().pipe(take(1))
  }

  openRenameFileDialog(filePath: string): Observable<string> {
    const ref = this.dialog.open(RenameFileDialogComponent, {
      data: filePath,
      hasBackdrop: true,
      minWidth: '400px',
      maxWidth: '600px',
    })
    return ref.afterClosed().pipe(take(1))
  }

  openDeleteFilesDialog(pathContainer: FilePathContainer): Observable<string> {
    const ref = this.dialog.open(DeleteFilesDialogComponent, {
      data: pathContainer,
      minWidth: '400px',
      maxWidth: '600px',
      hasBackdrop: true,
    })
    return ref.afterClosed().pipe(take(1))
  }

  openMoveFilesDialog(
    pathContainer: FilePathContainer,
    selectedFiles: TreeElement[],
    target: TreeElement
  ): Observable<any> {
    const ref = this.dialog.open(MoveFilesDialogComponent, {
      data: { pathContainer, selectedFiles, target },
      width: '20%',
      minWidth: '500px',
      hasBackdrop: true,
    })
    return ref.afterClosed().pipe(take(1))
  }

  openToast(message: string, type: 'success' | 'failure' | 'info', duration = 5000): void {
    this.zone.run(() => {
      const panelClass = `snackbar-${type}`
      const snackBar = this._snackBar.open(message, 'Close', {
        duration,
        panelClass,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      })
      snackBar.onAction().subscribe(() => snackBar.dismiss())
    })
  }
}
