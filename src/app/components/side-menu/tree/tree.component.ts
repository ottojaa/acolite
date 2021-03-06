import { ChangeDetectionStrategy, Component, Input, NgZone, ViewChild } from '@angular/core'
import { MenuItem, TreeNode } from 'primeng/api'
import { ContextMenu } from 'primeng/contextmenu'
import { Tree } from 'primeng/tree'
import { take } from 'rxjs/operators'
import { AbstractComponent } from '../../../abstract/abstract-component'
import { ElectronService } from '../../../core/services'
import { AppDialogService } from '../../../services/dialog.service'
import { StateService } from '../../../services/state.service'
import { TabService } from '../../../services/tab.service'
import { TreeElement, ActiveIndent, FileEntity, ConfirmDialogConfig } from '../../../../../app/shared/interfaces'
import { uniqBy, intersection } from 'lodash'
import { getPathsToBeModified, pathContainerIsEmpty } from 'app/components/helpers/menu-helpers'

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent extends AbstractComponent {
  @Input() files: TreeElement[]
  @Input() workspace: string | undefined
  @Input() activeIndent: ActiveIndent
  @ViewChild('contextMenu') cm: ContextMenu
  @ViewChild('contextMenuDropZone') cmDropZone: ContextMenu
  @ViewChild('pTree') pTree: Tree

  selectedFiles: TreeElement[] = []
  selection: TreeElement[] = [] // Used for shift-key multi selection, as primeng tree does not support it for some reason.
  contextMenuItems: MenuItem[]
  dropZoneContextMenuItems: MenuItem[]
  draggedElements: TreeElement[]
  isHovering = false
  isDragging = false

  constructor(
    private state: StateService,
    private electronService: ElectronService,
    private dialogService: AppDialogService,
    private tabService: TabService,
    private ngZone: NgZone
  ) {
    super()
  }

  onSelectFile(event: { node: TreeElement; originalEvent: MouseEvent }): void {
    const { node, originalEvent } = event
    const { shiftKey, metaKey } = originalEvent
    if (shiftKey) {
      this.handleShiftClickSelection(node)
    }
    const modifierKeyPressed = shiftKey || metaKey

    if (!modifierKeyPressed) {
      if (node.type === 'file') {
        this.tabService.openNewTab(node.data.filePath)
      }
    }
    this.selection = this.selectedFiles
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

  onRightClick(event: { node: TreeElement }): void {
    this.cmDropZone.hide()
    this.contextMenuItems = [...this.getMenuItems(event.node)]
  }

  onClickOutside(): void {
    this.selectedFiles = []
    this.selection = []
  }

  onUnselectFile(): void {
    this.selectedFiles = []
    this.selection = []
  }

  onRightClickDropZone(event: MouseEvent): void {
    this.cm.hide()
    this.dropZoneContextMenuItems = this.getDropZoneContextMenuItems()
    this.cmDropZone.show(event)
  }

  onDrop(event: { dragNode: TreeElement; dropNode: TreeElement }): void {
    const { dragNode, dropNode } = event

    if (dropNode.type !== 'folder') {
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

  filesDroppedFromOutside(filePaths: string[], targetNode?: TreeElement): void {
    if (!targetNode) {
      targetNode = this.state.getStatePartValue('rootDirectory')
    }
    const conflicts = intersection(
      targetNode.children.map((child) => window.path.getBaseName(child.data.filePath)),
      filePaths.map((path) => window.path.getBaseName(path))
    )

    const copyRequest = () => {
      this.electronService.copyFilesRequest({
        filePathsToCopy: filePaths,
        state: this.state.value,
        target: targetNode,
      })
    }

    if (conflicts.length) {
      const bannedNodes = targetNode.children.filter((child) =>
        conflicts.includes(window.path.getBaseName(child.data.filePath))
      )

      this.ngZone.run(() => {
        const config: ConfirmDialogConfig = {
          title: 'The following file(s) already exist in the destination. Replace?',
          fileList: bannedNodes,
          buttonLabels: {
            confirm: 'Replace',
            cancel: 'Cancel',
          },
        }
        this.dialogService.openConfirmDialog(config).subscribe((data) => {
          if (data) {
            copyRequest()
          }
        })
      })
    } else {
      copyRequest()
    }
  }

  createNewFolder(node: TreeElement): void {
    const { filePath } = node.data

    this.dialogService
      .openFolderNameDialog(filePath)
      .pipe(take(1))
      .subscribe((name: string) => {
        if (name) {
          this.electronService.createNewFolderRequest({
            directoryName: name,
            parentPath: filePath,
            state: this.state.value,
          })
        }
      })
  }

  dragStart(node: TreeElement): void {
    this.isDragging = true
    const nodeIdx = this.selectedFiles.findIndex((file) => file.data.filePath === node.data.filePath)
    if (nodeIdx === -1) {
      this.selectedFiles.push(node)
    }

    this.draggedElements = this.selectedFiles
  }

  dragEnd(): void {
    this.isDragging = false
  }

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

  openNewFileDialog(node: TreeElement): void {
    this.ngZone.run(() => {
      this.dialogService.openNewFileCreationDialog(node).pipe(take(1)).subscribe()
    })
  }

  openRenameFileDialog(node: TreeElement): void {
    this.ngZone.run(() => {
      this.dialogService.openRenameFileDialog(node).pipe(take(1)).subscribe()
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
  getMenuItems(baseItem: TreeElement): MenuItem[] {
    const isFolder = (node: TreeElement) => node.type === 'folder'
    let baseItems = [
      {
        label: 'Rename',
        command: (_event) => this.openRenameFileDialog(baseItem),
      },
      {
        label: 'Show in folder',
        command: () => this.tabService.openTabInFileLocation(baseItem.data.filePath),
      },
      { separator: true },
      {
        label: this.isMultipleSelected(this.selectedFiles) ? 'Delete files' : 'Delete file',
        icon: 'pi pi-trash',
        styleClass: 'delete',
        command: (_event) => this.openDeleteFilesDialog(),
      },
    ]
    if (isFolder(baseItem)) {
      const additionalItems = [
        {
          label: 'New file',
          command: () => this.openNewFileDialog(baseItem),
        },
        {
          label: 'New folder',
          command: () => this.createNewFolder(baseItem),
        },
      ]
      baseItems = [...additionalItems, ...baseItems]
    }

    return baseItems
  }

  getDropZoneContextMenuItems(): MenuItem[] {
    const baseItem = this.state.getStatePartValue('rootDirectory')
    return [
      {
        label: 'New file',
        command: () => this.openNewFileDialog(baseItem),
      },
      {
        label: 'New folder',
        command: () => this.createNewFolder(baseItem),
      },
      {
        label: 'Show in folder',
        command: () => this.tabService.openTabInFileLocation(baseItem.data.filePath),
      },
    ]
  }
  isMultipleSelected(selectedFiles: TreeNode<FileEntity>[]): boolean {
    return selectedFiles?.length > 1
  }

  isFolderSelected(selectedFiles: TreeNode<FileEntity>[]): boolean {
    return selectedFiles?.length === 1 && selectedFiles[0].type === 'folder'
  }
}
