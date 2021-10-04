import { Directive, ElementRef, HostListener, Input } from '@angular/core'

/**
 * Allows setting focus to normally untargetable elements like <li>. By default sets focus on the elements, but e.g checkboxes need to be clicked instead.
 */

@Directive({
  selector: '[keyboardNavigationList]',
})
export class KeyboardNavigationListDirective {
  @Input('keyboardNavigationType') type: 'focus' | 'click' = 'focus'

  currentIndex: number | undefined

  get items(): HTMLElement[] {
    return Array.from(
      this.element.nativeElement.getElementsByClassName(
        'keyboard-navigation-item'
      )
    )
  }

  constructor(private element: ElementRef) {}

  selectFirstElementIfExists(): void {
    if (this.items.length) {
      this.items[0].focus()
      this.currentIndex = 0
    }
  }

  previous(): void {
    const newIdx = this.currentIndex - 1
    if (newIdx >= 0) {
      this.items[newIdx][this.type]()
      this.currentIndex--
    }
  }

  next(): void {
    if (this.currentIndex === undefined) {
      this.selectFirstElementIfExists()
      return
    }
    const newIdx = this.currentIndex + 1
    if (newIdx < this.items.length) {
      this.items[newIdx][this.type]()
      this.currentIndex++
    }
  }

  clickCurrent(): void {
    this.items[this.currentIndex].click()
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.items.length) {
      return
    }

    switch (event.key) {
      case 'ArrowUp': {
        this.previous()
        event.preventDefault()
        break
      }
      case 'ArrowDown': {
        this.next()
        event.preventDefault()
        break
      }
      case 'Enter': {
        this.clickCurrent()
        event.preventDefault()
        break
      }
      default:
    }
  }
}
