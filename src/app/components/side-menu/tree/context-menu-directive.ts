import { Directive, ElementRef, HostListener, Input } from '@angular/core'

/**
 * Allows setting focus to normally untargetable elements like <li>. By default sets focus on the elements, but e.g checkboxes need to be clicked instead.
 */

@Directive({
  selector: '[preventContextMenu]',
})
export class ContextMenuPreventDirective {
  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    event.preventDefault()
    // Logs the id of the element
    // where the event is originally invoked.
    console.log(event)
  }
}
