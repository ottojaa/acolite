import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { NgLetDirective } from './ng-let.directive'

@NgModule({
  declarations: [NgLetDirective],
  exports: [NgLetDirective],
  imports: [CommonModule],
})
export class NgLetModule {}
