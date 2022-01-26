import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EditorContentLoaderComponent } from './editor-content-loader.component'
import { PdfEditorModule } from '../pdf-editor/pdf-editor.module'
import { ImageEditorModule } from '../image-editor/image-editor.module'
import { MarkdownEditorContainerModule } from '../markdown-editor/markdown-editor.module'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MonacoEditorComponentModule } from '../monaco-editor/ngx-monaco-editor.module'

@NgModule({
  declarations: [EditorContentLoaderComponent],
  exports: [EditorContentLoaderComponent],
  imports: [
    CommonModule,
    MarkdownEditorContainerModule,
    PdfEditorModule,
    MonacoEditorComponentModule,
    ImageEditorModule,
    MatProgressBarModule,
  ],
})
export class EditorContentLoaderModule {}
