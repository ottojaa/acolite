import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormatFileSizePipe } from './format-file-size.pipe'

@NgModule({
  declarations: [FormatFileSizePipe],
  imports: [CommonModule],
  exports: [FormatFileSizePipe],
  providers: [FormatFileSizePipe],
})
export class FormatFileSizePipeModule {}
