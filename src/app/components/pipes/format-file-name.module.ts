import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormatFileNamePipe } from './format-file-name.pipe'

@NgModule({
  declarations: [FormatFileNamePipe],
  imports: [CommonModule],
  exports: [FormatFileNamePipe],
  providers: [FormatFileNamePipe],
})
export class FormatFileNamePipeModule {}
