import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { ChangeDirectoryDialogComponent } from './change-directory-dialog.component'
import { AppDialogService } from '../../../services/dialog.service'

@NgModule({
  declarations: [ChangeDirectoryDialogComponent],
  exports: [ChangeDirectoryDialogComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  providers: [AppDialogService, MatDialog],
})
export class ChangeDirectoryDialogModule {}
