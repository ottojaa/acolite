import { Directive, EventEmitter, HostListener, Output } from '@angular/core'

@Directive({
  selector: '[keyboardEvents]',
})
export class KeyboardEventsDirective {
  @Output() save = new EventEmitter()
  constructor() {}

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      this.save.emit()
    }
  }
}
