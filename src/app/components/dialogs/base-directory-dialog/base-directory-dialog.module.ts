import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BaseDirectoryDialogComponent } from './base-directory-dialog.component'
import { AppDialogService } from '../../../services/dialog.service'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'

@NgModule({
  declarations: [BaseDirectoryDialogComponent],
  exports: [BaseDirectoryDialogComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  providers: [AppDialogService, MatDialog],
})
export class BaseDirectoryDialogModule {}
