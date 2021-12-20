import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { KeyboardNavigationListDirective } from './keyboard-navigation-list.directive'
import { KeyboardNavigationItemDirective } from './keyboard-navigation-item.directive'

@NgModule({
  declarations: [KeyboardNavigationListDirective, KeyboardNavigationItemDirective],
  exports: [KeyboardNavigationListDirective, KeyboardNavigationItemDirective],
  imports: [CommonModule],
})
export class KeyboardNavigationModule {}
