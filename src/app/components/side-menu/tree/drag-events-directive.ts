import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core'

/**
 * Allows the element to receive drop events from outside of the electron application
 */
@Directive({
  selector: '[dragEvents]',
})
export class DragEventsDirective {
  @Output() filesDroppedFromOutside = new EventEmitter<string[]>()
  elRef: ElementRef

  constructor(el: ElementRef<HTMLElement>) {
    this.elRef = el
  }

  setHoverClass(method: 'add' | 'remove') {
    try {
      this.elRef.nativeElement.parentNode.parentNode.parentNode.parentNode.classList[method]('hovering')
    } catch {}
  }

  /**
   * If files were dropped from outside the window, dataTransfer.files object will contain the filePaths of the dragged element.
   * If dataTransfer.files is empty, files were dragged from inside the tree
   */
  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    this.setHoverClass('remove')
    const filePaths = Array.from(event.dataTransfer.files).map((file) => file.path)

    if (!filePaths.length) {
      return
    }

    this.filesDroppedFromOutside.emit(filePaths)
  }

  @HostListener('dragover', ['$event'])
  onDragover(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()

    this.setHoverClass('add')
  }

  @HostListener('dragleave', ['$event'])
  onDragleave(_event: DragEvent) {
    this.setHoverClass('remove')
  }
}
