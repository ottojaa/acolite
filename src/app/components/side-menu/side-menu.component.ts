import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { TreeNode } from 'primeng/api'
import { take, takeUntil, tap } from 'rxjs/operators'
import { FolderActions } from '../../../../app/actions'
import { AbstractComponent } from '../../abstract/abstract-component'
import { ElectronService } from '../../core/services'
import { FileEntity } from '../../interfaces/Menu'
import { AppDialogService } from '../../services/dialog.service'
import { StateService } from '../../services/state.service'

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent extends AbstractComponent implements OnInit {
  menuLoading: boolean = true
  files: TreeNode<FileEntity>[]

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
    this.state
      .getStatePart('menuItems')
      .pipe(takeUntil(this.destroy$))
      .subscribe((files) => {
        console.log(files)
        this.files = [...files].slice(0)
        this.menuLoading = false // TODO: add to state
        this.cdRef.detectChanges()
      })
  }

  createNewFolder(): void {
    this.dialogService
      .openFolderNameDialog()
      .pipe(take(1))
      .subscribe((name: string) => {
        const baseDir = this.state.state$.value.baseDir
        if (name && baseDir) {
          this.electronService.send(FolderActions.MkDir, [name, baseDir])
        }
      })
  }

  expandAll() {
    this.state.value.menuItems.forEach((node) => {
      this.expandRecursive(node, true)
    })
  }

  collapseAll() {
    this.state.value.menuItems.forEach((node) => {
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
    this.router.navigate(['/'])
  }
}
