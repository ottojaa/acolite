import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SearchBuilderDialogComponent } from './search-builder-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatListModule } from '@angular/material/list'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { DateRangePickerModule } from '../../common/date-range-picker/date-range-picker.module'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [SearchBuilderDialogComponent],
  exports: [SearchBuilderDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatListModule,
    MatInputModule,
    MatDatepickerModule,
    DateRangePickerModule,
    MatIconModule,
  ],
  providers: [MatDialog],
})
export class SearchBuilderDialogModule {}
