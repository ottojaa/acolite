import { Directive, ElementRef, HostListener, Input } from '@angular/core'

/**
 * Allows setting focus to normally untargetable elements like <li>. By default sets focus on the elements, but e.g checkboxes need to be clicked instead.
 */

@Directive({
  selector: '[shiftSelect]',
})
export class ShiftSelect {
  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    if (e.button == 0 && e.shiftKey) {
    }
  }
}
