import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SortableFileListComponent } from './sortable-file-table.component'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { ReactiveFormsModule } from '@angular/forms'
import { IconModule } from 'app/components/common/icon/icon.module'
import { FormatPathPipeModule } from 'app/components/pipes/format-path.module'
import { FormatFileNamePipeModule } from 'app/components/pipes/format-file-name.module'

@NgModule({
  declarations: [SortableFileListComponent],
  exports: [SortableFileListComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    IconModule,
    FormatPathPipeModule,
    FormatFileNamePipeModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SortableFileTableModule {}
