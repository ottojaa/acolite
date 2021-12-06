import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormatDistancePipe } from './format-distance.pipe'

@NgModule({
  declarations: [FormatDistancePipe],
  imports: [CommonModule],
  exports: [FormatDistancePipe],
  providers: [FormatDistancePipe],
})
export class FormatDistanceModule {}
