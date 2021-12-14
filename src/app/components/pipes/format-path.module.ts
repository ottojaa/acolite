import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormatPathPipe } from './format-path.pipe'

@NgModule({
  declarations: [FormatPathPipe],
  imports: [CommonModule],
  exports: [FormatPathPipe],
  providers: [FormatPathPipe],
})
export class FormatPathPipeModule {}
