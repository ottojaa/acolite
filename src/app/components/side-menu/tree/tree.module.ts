import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TreeModule } from 'primeng/tree'
import { TreeDragDropService } from 'primeng/api'
import { DragDropModule } from 'primeng/dragdrop'
import { ContextMenuModule } from 'primeng/contextmenu'
import { ClickOutsideModule } from 'ng-click-outside'
import { TreeComponent } from './tree.component'
import { FileCreationModule } from '../../dialogs/file-creation/file-creation.module'
import { MatIconModule } from '@angular/material/icon'
import { ShiftSelect } from './shift-select-directive'

@NgModule({
  declarations: [TreeComponent, ShiftSelect],
  exports: [TreeComponent],
  providers: [TreeDragDropService],
  imports: [
    CommonModule,
    TreeModule,
    ContextMenuModule,
    ClickOutsideModule,
    FileCreationModule,
    MatIconModule,
    DragDropModule,
  ],
})
export class FileTreeModule {}
