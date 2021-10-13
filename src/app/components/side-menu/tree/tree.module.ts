import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TreeModule } from 'primeng/tree'
import { TreeDragDropService } from 'primeng/api'
import { ContextMenuModule } from 'primeng/contextmenu'
import { ClickOutsideModule } from 'ng-click-outside'
import { TreeComponent } from './tree.component'
import { FileCreationModule } from '../../dialogs/file-creation/file-creation.module'
import { ContextMenuPreventDirective } from './context-menu-directive'

@NgModule({
  declarations: [TreeComponent, ContextMenuPreventDirective],
  exports: [TreeComponent],
  providers: [TreeDragDropService],
  imports: [CommonModule, TreeModule, ContextMenuModule, ClickOutsideModule, FileCreationModule],
})
export class FileTreeModule {}
