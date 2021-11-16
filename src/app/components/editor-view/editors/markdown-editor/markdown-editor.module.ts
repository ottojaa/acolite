import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MarkdownEditorModule } from '@mdefy/ngx-markdown-editor'
import { MarkdownEditorComponent } from './markdown-editor.component'

@NgModule({
  declarations: [MarkdownEditorComponent],
  exports: [MarkdownEditorComponent],
  imports: [CommonModule, MarkdownEditorModule],
})
export class MarkdownEditorContainerModule {}
