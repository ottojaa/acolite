import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EditorContentLoaderComponent } from './editor-content-loader.component'
import { JsonEditorModule } from '../json-editor/json-editor.module'
import { PdfEditorModule } from '../pdf-editor/pdf-editor.module'
import { TextEditorModule } from '../text-editor/text-editor.module'
import { ImageEditorModule } from '../image-editor/image-editor.module'
import { MarkdownEditorContainerModule } from '../markdown-editor/markdown-editor.module'

@NgModule({
  declarations: [EditorContentLoaderComponent],
  exports: [EditorContentLoaderComponent],
  imports: [
    CommonModule,
    JsonEditorModule,
    MarkdownEditorContainerModule,
    PdfEditorModule,
    TextEditorModule,
    ImageEditorModule,
  ],
})
export class EditorContentLoaderModule {}
