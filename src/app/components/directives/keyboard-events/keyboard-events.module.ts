import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { KeyboardEventsDirective } from './keyboard-events.directive'

@NgModule({
  declarations: [KeyboardEventsDirective],
  exports: [KeyboardEventsDirective],
  imports: [CommonModule],
})
export class KeyboardEventsModule {}
