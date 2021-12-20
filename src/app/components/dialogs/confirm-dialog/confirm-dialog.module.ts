import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ConfirmDialogComponent } from './confirm-dialog.component'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { AppDialogService } from 'app/services/dialog.service'
import { IconModule } from 'app/components/common/icon/icon.module'

@NgModule({
  declarations: [ConfirmDialogComponent],
  exports: [ConfirmDialogComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule, IconModule],
  providers: [AppDialogService, MatDialog],
})
export class ConfirmDialogModule {}
