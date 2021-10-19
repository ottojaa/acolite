import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RenameFileDialogComponent } from './rename-file-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'

@NgModule({
  declarations: [RenameFileDialogComponent],
  exports: [RenameFileDialogComponent],
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
export class RenameFileDialogModule {}
