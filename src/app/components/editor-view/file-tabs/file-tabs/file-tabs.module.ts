import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FileTabsComponent } from './file-tabs.component'
import { MatTabsModule } from '@angular/material/tabs'
import { MatIconModule } from '@angular/material/icon'
import { MatRippleModule } from '@angular/material/core'
import { TextEditorModule } from '../../editors/text-editor/text-editor.module'
import { ContextMenuModule } from 'primeng/contextmenu'

@NgModule({
  declarations: [FileTabsComponent],
  exports: [FileTabsComponent],
  imports: [CommonModule, MatTabsModule, MatIconModule, MatRippleModule, TextEditorModule, ContextMenuModule],
})
export class FileTabsModule {}
