import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TreeModule } from 'primeng/tree'
import { TreeDragDropService } from 'primeng/api'
import { DragDropModule } from 'primeng/dragdrop'
import { ContextMenuModule } from 'primeng/contextmenu'
import { ClickOutsideModule } from 'ng-click-outside'
import { TreeComponent } from './tree.component'
import { FileCreationModule } from '../../dialogs/file-creation/file-creation.module'
import { MatIconModule } from '@angular/material/icon'
import { ShiftSelectDirective } from './shift-select-directive'
import { IconModule } from 'app/components/common/icon/icon.module'
import { DragEventsDirective } from './drag-events-directive'

@NgModule({
  declarations: [TreeComponent, ShiftSelectDirective, DragEventsDirective],
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
    IconModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FileTreeModule {}
