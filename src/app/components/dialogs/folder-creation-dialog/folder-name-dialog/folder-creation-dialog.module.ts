import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatInputModule } from '@angular/material/input'
import { FolderCreationDialogComponent } from './folder-creation-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [FolderCreationDialogComponent],
  exports: [FolderCreationDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
  ],
  providers: [MatDialog],
})
export class FolderCreationDialogModule {}
