import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnInit, ViewChild } from '@angular/core'
import { uniqBy } from 'lodash'
import { MenuItem, TreeNode } from 'primeng/api'
import { ContextMenu } from 'primeng/contextmenu'
import { take } from 'rxjs/operators'
import { FileActions } from '../../../../../app/actions'
import { getFileEntityFromPath } from '../../../../../app/utils'
import { ElectronService } from '../../../core/services'
import { FileEntity, TreeElement } from '../../../interfaces/Menu'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent implements OnInit {
  @Input() files: TreeElement[]
  @ViewChild('contextMenu') cm: ContextMenu

  selectedFiles: TreeElement[] = []
  selection: TreeElement[] = [] // Used for shift-key multi selection, as primeng tree does not support it for some reason.
  contextMenuItems: MenuItem[]
  draggedElement: TreeElement

  constructor(
    private state: StateService,
    private electronService: ElectronService,
    private dialogService: AppDialogService,
    public cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.contextMenuItems = this.getMenuItems()
  }

  onSelectFile(event: { node: TreeNode; originalEvent: MouseEvent }): void {
    const { node, originalEvent } = event
    if (originalEvent.shiftKey) {
      this.handleShiftClickSelection(node)
    }
    this.selection = this.selectedFiles
    this.contextMenuItems = this.getMenuItems()
  }

  /**
   *
   * @param target
   */
  handleShiftClickSelection(target: TreeNode): void {
    const flattenedTreeItems = this.flattenTree(this.files, [])
    const lastSelectedItem = this.selection.pop()
    const start = flattenedTreeItems.findIndex((el) => el.data.filePath === lastSelectedItem.data.filePath)
    const end = flattenedTreeItems.findIndex((el) => el.data.filePath === target.data.filePath)
    const validSelection = start > -1 && end > -1 && start !== end

    if (validSelection) {
      const itemsInRange = flattenedTreeItems.slice(Math.min(start, end), Math.max(start, end) + 1)
      this.selectedFiles = uniqBy([...this.selection, ...itemsInRange], 'data.filePath')
    }
  }

  flattenTree(menuItems: TreeElement[], flattened: TreeElement[]): TreeElement[] {
    menuItems.forEach((item) => {
      flattened.push(item)
      if (item.children && item.expanded) {
        this.flattenTree(item.children, flattened)
      }
    })
    return flattened
  }

  expand(node: TreeNode): void {
    node.expanded = !node.expanded
  }

  onRightClick(_event: { node: TreeElement }): void {
    this.contextMenuItems = [...this.getMenuItems()]
    this.cdRef.detectChanges()
  }

  onClickOutside(): void {
    this.selectedFiles = []
    this.selection = []
  }

  onUnselectFile(): void {
    this.selectedFiles = []
    this.selection = []
  }

  onDrop(event: { dragNode: TreeElement; dropNode: TreeElement }): void {
    const { dragNode, dropNode } = event

    if (dropNode.data.type !== 'folder') {
      return
    }
    const isNodeInSelectedFiles = this.selectedFiles.find((file) => file.data.filePath === dragNode.data.filePath)
    if (!isNodeInSelectedFiles) {
      this.selectedFiles.push(dragNode)
    }

    const movingToSelf = this.selectedFiles.some((file) => file.data.filePath === dropNode.data.filePath)
    const movingToCurrentParent = this.selectedFiles.some((file) => file.data.parentPath === dropNode.data.filePath)
    if (movingToCurrentParent || movingToSelf) {
      return
    }

    this.ngZone.run(() => {
      this.dialogService.openMoveFilesDialog(this.selectedFiles, dropNode).pipe(take(1)).subscribe()
    })
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

  dragStart(node: TreeNode): void {
    this.draggedElement = node
  }

  dragEnd(node: TreeNode): void {
    console.log(node)
  }

  dropOutside(_event: DragEvent): void {
    const rootDir = this.state.getStatePartValue('rootDirectory')
    this.dialogService.openMoveFilesDialog([this.draggedElement], rootDir).pipe(take(1)).subscribe()
  }

  openNewFileDialog(): void {
    const { filePath } = this.selectedFiles[0].data
    this.dialogService.openNewFileCreationDialog(filePath).pipe(take(1)).subscribe()
  }

  openRenameFileDialog(): void {
    const { filePath } = this.selectedFiles[0].data
    this.dialogService.openRenameFileDialog(filePath).pipe(take(1)).subscribe()
  }

  openDeleteFilesDialog(): void {
    this.dialogService.openDeleteFilesDialog(this.selectedFiles).pipe(take(1)).subscribe()
  }

  /**
   * Menuitems declared here instead of a separate class / component as otherwise we need to pass a component reference to it
   */
  getMenuItems(): MenuItem[] {
    let baseItems = [
      {
        label: 'Reveal in finder',
        icon: 'pi pi-search',
        command: (event) => this.electronService.send(FileActions.OpenInFolder, event),
      },
      {
        label: this.isMultipleSelected(this.selectedFiles) ? 'Delete files' : 'Delete file',
        icon: 'pi pi-times',
        command: (_event) => this.openDeleteFilesDialog(),
      },
      {
        label: 'Modify tags',
        icon: 'pi pi-tags',
        command: (event) => this.electronService.send(FileActions.ModifyTags, event),
      },
    ]

    const singleSelected = !this.isMultipleSelected(this.selectedFiles)
    const folderSelected = this.isFolderSelected(this.selectedFiles)

    if (singleSelected || folderSelected) {
      let additionalItems = []

      if (folderSelected) {
        additionalItems.push(
          {
            label: 'New file',
            icon: 'pi pi-plus',
            command: () => this.openNewFileDialog(),
          },
          {
            label: 'New folder',
            icon: 'pi pi-folder',
            command: () => this.createNewFolder(this.selectedFiles[0].data.filePath),
          }
        )
      }
      if (singleSelected) {
        additionalItems.push({
          label: 'Rename',
          icon: 'pi pi-pencil',
          command: (_event) => this.openRenameFileDialog(),
        })
      }
      baseItems = [...additionalItems, { separator: true }, ...baseItems]
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
