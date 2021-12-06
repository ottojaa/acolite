import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DeleteFilesDialogComponent } from './delete-files-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule, MatDialog } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { IconModule } from 'app/components/common/icon/icon.module'

@NgModule({
  declarations: [DeleteFilesDialogComponent],
  exports: [DeleteFilesDialogComponent],
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
export class DeleteFilesDialogModule {}
