import { Component, NgZone, OnInit } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { AppDialogService } from 'app/services/dialog.service'
import { StateService } from 'app/services/state.service'
import { TreeNode } from 'primeng/api'
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-actions-menu',
  templateUrl: './actions-menu.component.html',
  styleUrls: ['./actions-menu.component.scss'],
})
export class ActionsMenuComponent implements OnInit {
  constructor(
    private dialogService: AppDialogService,
    private electronService: ElectronService,
    private state: StateService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {}

  openChangeWorkspaceDialog(): void {
    this.dialogService.openChangeWorkspaceDialog().subscribe()
  }

  createNewFolder(): void {
    const baseDir = this.state.state$.value.baseDir

    this.zone.run(() => {
      this.dialogService
        .openFolderNameDialog(baseDir)
        .pipe(take(1))
        .subscribe((name: string) => {
          if (name && baseDir) {
            const rootDirectory = this.state.getStatePartValue('rootDirectory')
            this.electronService.createNewFolderRequest({ directoryName: name, baseDir, rootDirectory })
          }
        })
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
}
