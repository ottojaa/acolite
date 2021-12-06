import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MoveFilesDialogComponent } from './move-files-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule, MatDialog } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { IconModule } from 'app/components/common/icon/icon.module'

@NgModule({
  declarations: [MoveFilesDialogComponent],
  exports: [MoveFilesDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    IconModule,
  ],
  providers: [MatDialog],
})
export class MoveFilesDialogModule {}
