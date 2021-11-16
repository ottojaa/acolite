import { ChangeDetectorRef, Component, Input, NgZone, OnInit, ViewChild } from '@angular/core'
import { uniq, uniqBy } from 'lodash'
import { MenuItem, TreeNode } from 'primeng/api'
import { ContextMenu } from 'primeng/contextmenu'
import { take } from 'rxjs/operators'
import { FileActions } from '../../../../../app/actions'
import { getPathsToBeModified, pathContainerIsEmpty } from '../../../../../app/directory-utils'
import { ElectronService } from '../../../core/services'
import { FileEntity, TreeElement } from '../../../interfaces/Menu'
import { AppDialogService } from '../../../services/dialog.service'
import { State, StateService, StateUpdate } from '../../../services/state.service'
import { TabService } from '../../../services/tab.service'

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent implements OnInit {
  @Input() files: TreeElement[]
  @Input() workspace: string | undefined
  @ViewChild('contextMenu') cm: ContextMenu

  selectedFiles: TreeElement[] = []
  selection: TreeElement[] = [] // Used for shift-key multi selection, as primeng tree does not support it for some reason.
  contextMenuItems: MenuItem[]
  draggedElements: TreeElement[]
  activeIndents: number[] = []
  isHovering = false

  constructor(
    private state: StateService,
    private electronService: ElectronService,
    private dialogService: AppDialogService,
    private tabService: TabService,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.contextMenuItems = this.getMenuItems()
  }

  onSelectFile(event: { node: TreeElement; originalEvent: MouseEvent }): void {
    const { node, originalEvent } = event
    const { shiftKey, metaKey } = originalEvent
    if (shiftKey) {
      this.handleShiftClickSelection(node)
    }
    const modifierKeyPressed = shiftKey || metaKey

    if (!modifierKeyPressed) {
      if (node.data.type === 'file') {
        this.tabService.openNewTab(node.data.filePath)
      }
    }
    this.selection = this.selectedFiles
  }

  getActiveIndents(): number[] {
    return uniq(this.selectedFiles.map((file) => file.data.indents))
  }

  /**
   * Gets the index range of the click target and the latest selected item, and selects everything in between.
   */
  handleShiftClickSelection(target: TreeNode): void {
    if (!this.selection.length) {
      return
    }
    const lastSelectedItem = this.selection.pop()
    const flattenedTreeItems = this.flattenTree(this.files, [])

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
      if (item.children?.length && item.expanded) {
        this.flattenTree(item.children, flattened)
      }
    })
    return flattened
  }

  expand(event: MouseEvent, node: TreeNode): void {
    if (event.shiftKey || event.metaKey) {
      return
    }
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

    const pathContainer = getPathsToBeModified(this.selectedFiles, dropNode)

    if (pathContainerIsEmpty(pathContainer)) {
      return
    }

    this.ngZone.run(() => {
      this.dialogService.openMoveFilesDialog(pathContainer, this.selectedFiles, dropNode).pipe(take(1)).subscribe()
    })
  }

  createNewFolder(filePath: string): void {
    const baseDir = this.state.state$.value.baseDir

    this.dialogService
      .openFolderNameDialog(filePath)
      .pipe(take(1))
      .subscribe((name: string) => {
        if (name) {
          const rootDirectory = this.state.getStatePartValue('rootDirectory')
          this.electronService.createNewFolderRequest({
            directoryName: name,
            baseDir,
            rootDirectory,
            parentPath: filePath,
          })
        }
      })
  }

  dragStart(node: TreeElement): void {
    const nodeIdx = this.selectedFiles.findIndex((file) => file.data.filePath === node.data.filePath)
    if (nodeIdx === -1) {
      this.selectedFiles.push(node)
    }

    this.draggedElements = this.selectedFiles
  }

  dragEnd(): void {}

  onDragEnter(event: Event): void {
    this.isHovering = true
    event.preventDefault()
  }

  onDragLeave(event: Event): void {
    this.isHovering = false
    event.preventDefault()
  }

  dropOutside(_event: DragEvent): void {
    this.isHovering = false
    const rootDir = this.state.getStatePartValue('rootDirectory')
    const pathContainer = getPathsToBeModified(this.selectedFiles, rootDir)

    if (pathContainerIsEmpty(pathContainer)) {
      return
    }

    this.dialogService
      .openMoveFilesDialog(pathContainer, this.draggedElements, rootDir)
      .pipe(take(1))
      .subscribe(() => (this.draggedElements = null))
  }

  openNewFileDialog(): void {
    const { filePath } = this.selectedFiles[0].data
    this.ngZone.run(() => {
      this.dialogService.openNewFileCreationDialog(filePath).pipe(take(1)).subscribe()
    })
  }

  openRenameFileDialog(): void {
    const { filePath } = this.selectedFiles[0].data
    this.ngZone.run(() => {
      this.dialogService.openRenameFileDialog(filePath).pipe(take(1)).subscribe()
    })
  }

  openDeleteFilesDialog(): void {
    const pathContainer = getPathsToBeModified(this.selectedFiles)

    if (pathContainerIsEmpty(pathContainer)) {
      return
    }

    this.ngZone.run(() => {
      this.dialogService.openDeleteFilesDialog(pathContainer).pipe(take(1)).subscribe()
    })
  }

  /**
   * Menuitems declared here instead of a separate class / component as otherwise we need to pass a component reference to it
   */
  getMenuItems(): MenuItem[] {
    let baseItems = [
      {
        label: this.isMultipleSelected(this.selectedFiles) ? 'Delete files' : 'Delete file',
        icon: 'pi pi-times',
        command: (_event) => this.openDeleteFilesDialog(),
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
        additionalItems.push(
          {
            label: 'Rename',
            icon: 'pi pi-pencil',
            command: (_event) => this.openRenameFileDialog(),
          },
          {
            label: 'Reveal in finder',
            icon: 'pi pi-search',
            command: () => this.tabService.openTabInFileLocation(this.selectedFiles[0].data.filePath),
          }
        )
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
