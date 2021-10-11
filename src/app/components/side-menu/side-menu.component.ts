import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { MenuItem, TreeNode } from 'primeng/api'
import { of } from 'rxjs'
import { map, switchMap, take, tap } from 'rxjs/operators'
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
export class SideMenuComponent implements OnInit {
  files: TreeNode[]
  selectedFiles: TreeNode[]
  contextMenuItems: MenuItem[]

  constructor(
    private menuService: MenuService,
    private dialogService: AppDialogService,
    public electronService: ElectronService,
    public state: StateService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.menuService.getMenuItems().then((files) => (this.files = files))
    this.contextMenuItems = this.getMenuItems()
  }

  onRightClick(event: any): void {
    console.log(event)
  }

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
    this.files.forEach((node) => {
      this.expandRecursive(node, true)
    })
  }

  collapseAll() {
    this.files.forEach((node) => {
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
          return this.state.getStatePart('baseDir').pipe(
            tap((data) => console.log(data)),
            map((baseDir) => ({ name, baseDir }))
          )
        })
      )
      .subscribe((data: { name: string; baseDir: string }) => {
        console.log(data)
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
