import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
} from '@angular/core'

/**
 * Used to just set the tabIndexes and class for  elements navigable by keyboard
 */

@Directive({
  selector: '[keyboardNavigationItem]',
})
export class KeyboardNavigationItemDirective {
  @HostBinding('attr.tabindex') tabIndex = -1
  @HostBinding('class.keyboard-navigation-item') can = true

  constructor() {}
}
