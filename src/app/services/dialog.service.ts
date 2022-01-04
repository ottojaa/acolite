import { ElementRef, Injectable, NgZone } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfirmDialogComponent } from 'app/components/dialogs/confirm-dialog/confirm-dialog.component'
import { TagEditorComponent } from 'app/components/top-bar/tag-editor/tag-editor.component'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'
import { getBaseName } from '../../../app/electron-utils/file-utils'
import { ConfirmDialogConfig, FilePathContainer, TreeElement } from '../../../app/shared/interfaces'
import { BaseDirectoryDialogComponent } from '../components/dialogs/base-directory-dialog/base-directory-dialog.component'
import { ChangeDirectoryDialogComponent } from '../components/dialogs/change-directory-dialog/change-directory-dialog.component'
import { DeleteFilesDialogComponent } from '../components/dialogs/delete-files-dialog/delete-files-dialog.component'
import { FileCreationComponent } from '../components/dialogs/file-creation/file-creation.component'
import { FolderCreationDialogComponent } from '../components/dialogs/folder-creation-dialog/folder-name-dialog/folder-creation-dialog.component'
import { MoveFilesDialogComponent } from '../components/dialogs/move-files-dialog/move-files-dialog.component'
import { RenameFileDialogComponent } from '../components/dialogs/rename-file-dialog/rename-file-dialog.component'
import { SearchBuilderDialogComponent } from '../components/dialogs/search-builder-dialog/search-builder-dialog.component'
import { StateService } from './state.service'
@Injectable({
  providedIn: 'root',
})
export class AppDialogService {
  constructor(
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private zone: NgZone,
    private state: StateService
  ) {}

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

  openTagEditor(): Observable<string | undefined> {
    const ref = this.dialog.open(TagEditorComponent)
    return ref.afterClosed().pipe(take(1))
  }

  openSearchBuilder(elRef: ElementRef): Observable<string | undefined> {
    const ref = this.dialog.open(SearchBuilderDialogComponent, {
      hasBackdrop: false,
      width: '450px',
      data: {
        positionRelativeToElement: elRef,
      },
    })
    return ref.afterClosed().pipe(take(1))
  }

  openNewFileCreationDialog(node: TreeElement): Observable<{ extension: 'txt' | 'md'; fileName: string }> {
    const bannedFileNames = this.getBannedFileNames(node, 'create')
    const filePath = node.data.filePath

    const ref = this.dialog.open(FileCreationComponent, {
      data: { filePath, bannedFileNames },
      minWidth: '400px',
      maxWidth: '600px',
      hasBackdrop: true,
      position: {},
    })
    return ref.afterClosed().pipe(take(1))
  }

  openRenameFileDialog(node: TreeElement): Observable<string> {
    const filePath = node.data.filePath
    const bannedFileNames = this.getBannedFileNames(node, 'rename')

    const ref = this.dialog.open(RenameFileDialogComponent, {
      data: { filePath, bannedFileNames },
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
      width: '300px',
      hasBackdrop: true,
    })
    return ref.afterClosed().pipe(take(1))
  }

  openToast(message: string, type: 'success' | 'failure' | 'info', duration = 3000): void {
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

  openConfirmDialog(config: ConfirmDialogConfig): Observable<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, { data: { ...config } })
    return ref.afterClosed().pipe(take(1))
  }

  getBannedFileNames(node: TreeElement, action: 'rename' | 'create'): any {
    const getBannedNodes = (actionType: 'rename' | 'create') => {
      switch (actionType) {
        case 'rename': {
          if (!node.parent) {
            const rootDirectory = this.state.getStatePartValue('rootDirectory')

            const findSiblingsRecursive = (elements: TreeElement[]) => {
              for (const element of elements) {
                if (element.data.filePath === node.data.parentPath) {
                  return element.children
                }
                if (element.children) {
                  findSiblingsRecursive(element.children)
                }
              }
            }
            return findSiblingsRecursive([rootDirectory]) || []
          }
          return node.parent.children
        }
        case 'create': {
          return node.children ? node.children : []
        }
        default: {
          return []
        }
      }
    }

    return getBannedNodes(action).map((el) => getBaseName(el.data.filePath))
  }
}
