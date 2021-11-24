import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SearchBuilderDialogComponent } from './search-builder-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

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
    MatInputModule,
  ],
  providers: [MatDialog],
})
export class SearchBuilderDialogModule {}
