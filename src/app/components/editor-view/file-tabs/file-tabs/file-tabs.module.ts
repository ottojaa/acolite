import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FileTabsComponent } from './file-tabs.component'
import { MatTabsModule } from '@angular/material/tabs'
import { MatIconModule } from '@angular/material/icon'
import { MatRippleModule } from '@angular/material/core'
import { ContextMenuModule } from 'primeng/contextmenu'
import { MarkdownEditorContainerModule } from '../../editors/markdown-editor/markdown-editor.module'
import { IconModule } from 'app/components/common/icon/icon.module'
import { EditorContentLoaderModule } from '../../editors/editor-content-loader/editor-content-loader.module'

@NgModule({
  declarations: [FileTabsComponent],
  exports: [FileTabsComponent],
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatRippleModule,
    ContextMenuModule,
    MarkdownEditorContainerModule,
    IconModule,
    EditorContentLoaderModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FileTabsModule {}
