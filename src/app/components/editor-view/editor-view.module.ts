import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EditorViewComponent } from './editor-view.component'
import { FileTabsModule } from './file-tabs/file-tabs/file-tabs.module'

@NgModule({
  declarations: [EditorViewComponent],
  exports: [EditorViewComponent],
  imports: [CommonModule, FileTabsModule],
})
export class EditorViewModule {}
