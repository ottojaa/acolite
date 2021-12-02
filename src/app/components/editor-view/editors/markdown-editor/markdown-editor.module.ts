import { NgModule, SecurityContext } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MarkdownEditorModule } from '@mdefy/ngx-markdown-editor'
import { MarkdownEditorViewComponent } from './markdown-editor.component'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'

@NgModule({
  declarations: [MarkdownEditorViewComponent],
  exports: [MarkdownEditorViewComponent],
  imports: [
    CommonModule,
    MarkdownEditorModule.forRoot({
      previewConfig: {
        sanitize: SecurityContext.NONE,
      },
    }),
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
})
export class MarkdownEditorContainerModule {}
