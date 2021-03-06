import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FileCreationComponent } from './file-creation.component'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatCheckboxModule } from '@angular/material/checkbox'

@NgModule({
  declarations: [FileCreationComponent],
  exports: [FileCreationComponent],
  imports: [
    CommonModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  providers: [MatDialog],
})
export class FileCreationModule {}
