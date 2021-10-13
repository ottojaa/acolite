import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { MenuItem, TreeNode } from 'primeng/api'
import { Observable, of } from 'rxjs'
import { delay, finalize, map, switchMap, take, takeUntil, tap } from 'rxjs/operators'
import { AbstractComponent } from '../../abstract/abstract-component'
import { ElectronService } from '../../core/services'
import { FileActions } from '../../entities/file/constants'
import { FolderActions } from '../../entities/folder/constants'
import { AppDialogService } from '../../services/dialog.service'
import { MenuService } from '../../services/menu.service'
import { StateService } from '../../services/state.service'

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent extends AbstractComponent implements OnInit {
  menuLoading: boolean = true
  treeNodes: TreeNode[]
  selectedFiles: TreeNode[]
  contextMenuItems: MenuItem[]

  constructor(
    private dialogService: AppDialogService,
    public electronService: ElectronService,
    public state: StateService,
    public router: Router,
    public cdRef: ChangeDetectorRef
  ) {
    super()
  }

  ngOnInit(): void {
    this.contextMenuItems = this.getMenuItems()
    this.menuUpdateListener()
  }

  menuUpdateListener(): void {
    this.state
      .getStatePart('menuItems')
      .pipe(takeUntil(this.destroy$), delay(3000))
      .subscribe((data) => {
        this.treeNodes = data.slice(0)
        this.menuLoading = false
      })
  }

  triggerMenuUpdate(): void {
    const test = this.state.state$.value.menuItems
    this.state.updateState$.next({ key: 'menuItems', payload: test })
  }

  onRightClick(event: any): void {}

  onSelectFile(event: { node: TreeNode; originalEvent: MouseEvent }): void {
    this.contextMenuItems = this.getMenuItems()
  }

  onClickOutside(): void {
    this.selectedFiles = []
  }

  onUnselectFile(): void {
    this.selectedFiles = []
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

  createNewFolder(): void {
    this.dialogService
      .openFolderNameDialog()
      .pipe(
        take(1),
        switchMap((name) => {
          return this.state.getStatePart('baseDir').pipe(map((baseDir) => ({ name, baseDir })))
        })
      )
      .subscribe((data: { name: string; baseDir: string }) => {
        const { name, baseDir } = data
        if (name && baseDir) {
          this.electronService.send(FolderActions.MkDir, [name, baseDir])
        }
      })
  }

  /**
   * Menuitems declared here instead of a separate class / component as otherwise we need to pass a component reference to it
   */
  getMenuItems(): MenuItem[] {
    return [
      {
        label: 'File',
        icon: 'pi pi-file',
        items: [
          {
            label: 'Reveal in finder',
            icon: 'pi pi-search',
            command: (event) => this.electronService.send(FileActions.OpenInFolder, event),
          },
          {
            label: this.isMultipleSelected(this.selectedFiles) ? 'Delete files' : 'Delete file',
            icon: 'pi pi-times',
            command: (event) => {
              this.electronService.send(FileActions.Delete, event)
            },
          },
          {
            label: 'Rename file',
            icon: 'pi pi-pencil',
            command: (event) => this.electronService.send(FileActions.Rename, event),
          },
        ],
      },
      {
        label: 'Modify tags',
        icon: 'pi pi-tags',
        command: (event) => this.electronService.send(FileActions.ModifyTags, event),
      },
      {
        separator: true,
      },
      {
        label: 'Unselect',
        icon: 'pi pi-times',
        command: () => this.onUnselectFile(),
      },
    ]
  }

  isMultipleSelected(selectedFiles: MenuItem[]): boolean {
    console.log(selectedFiles?.length > 1)
    return selectedFiles?.length > 1
  }
}
