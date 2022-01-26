import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgxMonacoEditorComponent } from './ngx-monaco-editor.component'
import { TextFieldModule } from '@angular/cdk/text-field'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { ContextMenuModule } from 'primeng/contextmenu'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { EditorTopBarModule } from '../editor-top-bar/editor-top-bar.module'
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

@NgModule({
  declarations: [NgxMonacoEditorComponent],
  exports: [NgxMonacoEditorComponent],
  imports: [
    CommonModule,
    TextFieldModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    ContextMenuModule,
    MatSlideToggleModule,
    EditorTopBarModule,
    MonacoEditorModule,
    MatProgressSpinnerModule,
  ],
})
export class MonacoEditorComponentModule {}
