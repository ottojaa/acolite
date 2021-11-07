import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TextEditorComponent } from './text-editor.component'
import { TextFieldModule } from '@angular/cdk/text-field'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'

@NgModule({
  declarations: [TextEditorComponent],
  exports: [TextEditorComponent],
  imports: [
    CommonModule,
    TextFieldModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
})
export class TextEditorModule {}