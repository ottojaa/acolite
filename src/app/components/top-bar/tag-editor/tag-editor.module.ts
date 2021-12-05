import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TagEditorComponent } from './tag-editor.component'

@NgModule({
  declarations: [TagEditorComponent],
  exports: [TagEditorComponent],
  imports: [CommonModule],
})
export class TagEditorModule {}
