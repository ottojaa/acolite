import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core'

/**
 * Allows the element to receive drop events from outside of the electron application
 */
@Directive({
  selector: '[dragEvents]',
})
export class DragEvents {
  @Output() filesDroppedFromOutside = new EventEmitter<string[]>()
  elRef: ElementRef

  constructor(el: ElementRef<HTMLElement>) {
    this.elRef = el
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    this.elRef.nativeElement.classList.remove('hovering')
    event.preventDefault()
    event.stopPropagation()
    const filePaths = Array.from(event.dataTransfer.files).map((file) => file.path)

    this.filesDroppedFromOutside.emit(filePaths)
  }
  @HostListener('dragover', ['$event'])
  onDragover(event: DragEvent) {
    this.elRef.nativeElement.classList.add('hovering')
    event.preventDefault()
    event.stopPropagation()
  }
  @HostListener('dragleave', ['$event'])
  onDragleave(_event: DragEvent) {
    this.elRef.nativeElement.classList.remove('hovering')
  }
}
