import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { TreeNode } from 'primeng/api'
import { Observable } from 'rxjs'
import { filter, map, take, takeUntil, tap } from 'rxjs/operators'
import { AbstractComponent } from '../../abstract/abstract-component'
import { ElectronService } from '../../core/services'
import { TreeElement } from '../../interfaces/Menu'
import { AppDialogService } from '../../services/dialog.service'
import { StateService } from '../../services/state.service'
import { getBaseName } from '../../utils/file-utils'
import { removeExistingStyleClasses } from '../../utils/menu-utils'

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent extends AbstractComponent implements OnInit {
  menuLoading: boolean = true
  files: TreeElement[]
  workspaceName: string
  files$: Observable<TreeElement[]>

  constructor(
    public electronService: ElectronService,
    public dialogService: AppDialogService,
    public state: StateService,
    public router: Router,
    public cdRef: ChangeDetectorRef
  ) {
    super()
  }

  ngOnInit(): void {
    this.menuLoading = true
    this.files$ = this.state.getStatePart('rootDirectory').pipe(
      takeUntil(this.destroy$),
      tap((rootDir) => {
        if (rootDir && rootDir.data) {
          this.workspaceName = getBaseName(rootDir.data.filePath)
        }
      }),
      map((rootDir) => rootDir.children),
      tap((menuItems) => {
        if (menuItems && menuItems.length) {
          removeExistingStyleClasses(menuItems)
        }
        this.menuLoading = false
        this.cdRef.detectChanges()
      })
    )
  }

  openChangeWorkspaceDialog(): void {
    this.dialogService.openChangeWorkspaceDialog().subscribe()
  }

  createNewFolder(): void {
    const baseDir = this.state.state$.value.baseDir

    this.dialogService
      .openFolderNameDialog(baseDir)
      .pipe(take(1))
      .subscribe((name: string) => {
        if (name && baseDir) {
          const rootDirectory = this.state.getStatePartValue('rootDirectory')
          this.electronService.createNewFolderRequest({ directoryName: name, baseDir, rootDirectory })
        }
      })
  }

  expandAll() {
    this.state.value.rootDirectory.children.forEach((node) => {
      this.expandRecursive(node, true)
    })
  }

  collapseAll() {
    this.state.value.rootDirectory.children.forEach((node) => {
      this.expandRecursive(node, false)
    })
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand
    if (node.children) {
      node.children.forEach((childNode) => {
        this.expandRecursive(childNode, isExpand)
      })
    }
  }

  navigateToDirectorySelection(): void {
    this.router.navigate(['base-dir'])
  }
}
