import { Component, OnInit } from '@angular/core'
import { MenuItem, TreeNode } from 'primeng/api'
import { ElectronService } from '../../core/services'
import { FileActions } from '../../entities/file/constants'
import { MenuService } from '../../services/menu.service'

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
  files: TreeNode[]
  selectedFiles: TreeNode[]
  contextMenuItems: MenuItem[]

  constructor(private menuService: MenuService, public electronService: ElectronService) {}

  ngOnInit(): void {
    this.menuService.getMenuItems().then((files) => (this.files = files))
    this.contextMenuItems = this.getMenuItems()
  }

  onRightClick(event: any): void {
    console.log(event)
  }

  onSelectFile(event: { node: TreeNode; originalEvent: MouseEvent }): void {
    console.log(event.node)
    this.contextMenuItems = this.getMenuItems()
  }

  onClickOutside(): void {
    this.selectedFiles = []
  }

  onUnselectFile(): void {
    this.selectedFiles = []
  }

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
