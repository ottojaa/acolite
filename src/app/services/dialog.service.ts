import { Injectable, NgZone } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'
import { BaseDirectoryDialogComponent } from '../components/dialogs/base-directory-dialog/base-directory-dialog.component'
import { FileCreationComponent } from '../components/dialogs/file-creation/file-creation.component'
import { FolderNameDialogComponent } from '../components/dialogs/folder-name-dialog/folder-name-dialog/folder-name-dialog.component'

@Injectable({
  providedIn: 'root',
})
export class AppDialogService {
  constructor(public dialog: MatDialog, private _snackBar: MatSnackBar, public zone: NgZone) {}

  openWorkspaceDirectoryDialog(): Observable<string | undefined> {
    const ref = this.dialog.open(BaseDirectoryDialogComponent)

    return ref.afterClosed().pipe(take(1))
  }

  openFolderNameDialog(filePath: string): Observable<string | undefined> {
    const ref = this.dialog.open(FolderNameDialogComponent, { data: filePath })

    return ref.afterClosed().pipe(take(1))
  }

  openNewFileCreationDialog(filePath: string): Observable<{ extension: 'txt' | 'md'; fileName: string }> {
    const ref = this.dialog.open(FileCreationComponent, { data: filePath })

    return ref.afterClosed().pipe(take(1))
  }

  openToast(message: string, type: 'success' | 'failure' | 'info'): void {
    this.zone.run(() => {
      const panelClass = `snackbar-${type}`
      const snackBar = this._snackBar.open(message, 'Close', {
        duration: 500000,
        panelClass,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      })
      snackBar.onAction().subscribe(() => snackBar.dismiss())
    })
  }
}
