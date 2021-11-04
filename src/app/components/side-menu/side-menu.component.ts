import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { TreeNode } from 'primeng/api'
import { take, takeUntil, tap } from 'rxjs/operators'
import { AbstractComponent } from '../../abstract/abstract-component'
import { ElectronService } from '../../core/services'
import { TreeElement } from '../../interfaces/Menu'
import { AppDialogService } from '../../services/dialog.service'
import { StateService } from '../../services/state.service'
import { removeExistingStyleClasses } from '../../utils/menu-utils'

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent extends AbstractComponent implements OnInit {
  menuLoading: boolean = true
  files: TreeElement[]

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
      .getStatePart('rootDirectory')
      .pipe(takeUntil(this.destroy$))
      .subscribe((rootDir) => {
        console.log('HEHE')
        if (rootDir.children) {
          this.files = rootDir.children.slice(0)
        }
        this.menuLoading = false // TODO: add to state
        this.cdRef.detectChanges()

        // PrimeNG styleClasses get applied back on each rerender, so in order to do enter animations that don't happen on each rerender
        // we have to remove the styleClass properties from the menuItems after the animation is done.
        setTimeout(() => {
          removeExistingStyleClasses(this.files)
        }, 2000)
      })
  }

  createNewFolder(): void {
    const baseDir = this.state.state$.value.baseDir

    this.dialogService
      .openFolderNameDialog(baseDir)
      .pipe(take(1))
      .subscribe((name: string) => {
        if (name && baseDir) {
          const rootDirectory = this.state.getStatePartValue('rootDirectory')
          this.electronService.createNewFolderRequest({
            data: { directoryName: name, baseDir, rootDirectory },
          })
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
    this.router.navigate(['/'])
  }
}
