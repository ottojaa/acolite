import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatInputModule } from '@angular/material/input'
import { FolderNameDialogComponent } from './folder-name-dialog.component'
import { FormsModule } from '@angular/forms'

@NgModule({
  declarations: [FolderNameDialogComponent],
  exports: [FolderNameDialogComponent],
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, FormsModule, MatInputModule, MatDialogModule],
  providers: [MatDialog],
})
export class FolderNameDialogModule {}
