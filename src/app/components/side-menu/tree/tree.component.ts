import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { MenuItem, TreeNode } from 'primeng/api'
import { ContextMenu } from 'primeng/contextmenu'
import { take } from 'rxjs/operators'
import { FileActions } from '../../../../../app/actions'
import { ElectronService } from '../../../core/services'
import { FileEntity } from '../../../interfaces/Menu'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent implements OnInit {
  @Input() files: TreeNode<FileEntity>[]
  @ViewChild('contextMenu') cm: ContextMenu

  selectedFiles: TreeNode<FileEntity>[]
  contextMenuItems: MenuItem[]

  constructor(
    private state: StateService,
    private electronService: ElectronService,
    private dialogService: AppDialogService,
    public cdRef: ChangeDetectorRef,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.contextMenuItems = this.getMenuItems()
    this.elRef.nativeElement.addEventListener('keydown', console.log('test'))
  }

  onSelectFile(event: { node: TreeNode; originalEvent: MouseEvent }): void {
    this.contextMenuItems = this.getMenuItems()
  }

  onRightClick(event: any): void {
    this.cm.model = [...this.getMenuItems()]
  }

  onClickOutside(): void {
    this.selectedFiles = []
  }

  onUnselectFile(): void {
    this.selectedFiles = []
  }

  createNewFolder(filePath: string): void {
    const baseDir = this.state.state$.value.baseDir

    this.dialogService
      .openFolderNameDialog(filePath)
      .pipe(take(1))
      .subscribe((name: string) => {
        if (name) {
          const menuItems = this.state.getStatePartValue('menuItems')
          this.electronService.createNewFolderRequest({
            data: { directoryName: name, baseDir, menuItems, parentPath: filePath },
          })
        }
      })
  }

  openNewFileDialog(): void {
    const { filePath } = this.selectedFiles[0].data
    this.dialogService.openNewFileCreationDialog(filePath).pipe(take(1)).subscribe()
  }

  openRenameFileDialog(): void {
    const { filePath } = this.selectedFiles[0].data
    this.dialogService.openRenameFileDialog(filePath).pipe(take(1)).subscribe()
  }

  /**
   * Menuitems declared here instead of a separate class / component as otherwise we need to pass a component reference to it
   */
  getMenuItems(): MenuItem[] {
    let baseItems = [
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

    if (this.isFolderSelected(this.selectedFiles)) {
      baseItems[0].items = [
        {
          label: 'New file',
          icon: 'pi pi-plus',
          command: () => this.openNewFileDialog(),
        },
        {
          label: 'New folder',
          icon: 'pi pi-folder',
          command: () => this.createNewFolder(this.selectedFiles[0].data.filePath),
        },
        ...baseItems[0].items,
      ]
    }
    if (!this.isMultipleSelected(this.selectedFiles)) {
      baseItems[0].items = [
        ...baseItems[0].items,
        {
          label: 'Rename file',
          icon: 'pi pi-pencil',
          command: (_event) => this.openRenameFileDialog(),
        },
      ]
    }

    return baseItems
  }

  isMultipleSelected(selectedFiles: TreeNode<FileEntity>[]): boolean {
    return selectedFiles?.length > 1
  }

  isFolderSelected(selectedFiles: TreeNode<FileEntity>[]): boolean {
    return selectedFiles?.length === 1 && selectedFiles[0].data.type === 'folder'
  }
}
