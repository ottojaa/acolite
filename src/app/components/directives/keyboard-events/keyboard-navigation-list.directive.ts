import { Directive, ElementRef, HostListener, Input } from '@angular/core'

/**
 * Allows setting focus to normally untargetable elements like <li>. By default sets focus on the elements,
 * but e.g checkboxes need to be clicked instead.
 */

@Directive({
  selector: '[keyboardNavigationList]',
})
export class KeyboardNavigationListDirective {
  currentIndex: number | undefined

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

  get items(): HTMLElement[] {
    return Array.from(this.element.nativeElement.getElementsByClassName('keyboard-navigation-item'))
  }

  get parentEl(): HTMLElement {
    return document.getElementById('drop-down-list')
  }

  constructor(private element: ElementRef) {}

  selectFirstElementIfExists(): void {
    if (this.items.length) {
      this.items[0].classList.add('selected')
      this.scrollIntoViewIfNeeded(this.items[0])
      this.currentIndex = 0
    }
  }

  previous(): void {
    const newIdx = this.currentIndex - 1
    if (newIdx >= 0) {
      const currentEl = this.items[this.currentIndex]
      const newEl = this.items[newIdx]

      if (currentEl) {
        currentEl.classList.remove('selected')
      }
      if (newEl) {
        newEl.classList.add('selected')
        this.scrollIntoViewIfNeeded(newEl)
        this.currentIndex--
      } else {
        this.currentIndex = 0
      }
    }
  }

  next(): void {
    if (this.currentIndex === undefined || this.currentIndex > this.items.length) {
      this.selectFirstElementIfExists()
      return
    }

    const newIdx = this.currentIndex + 1
    if (newIdx < this.items.length) {
      const currentEl = this.items[this.currentIndex]
      const newEl = this.items[newIdx]

      if (currentEl) {
        currentEl.classList.remove('selected')
      }
      if (newEl) {
        newEl.classList.add('selected')
        this.scrollIntoViewIfNeeded(newEl)
        this.currentIndex++
      } else {
        this.currentIndex = 0
      }
    }
  }

  scrollIntoViewIfNeeded(child: HTMLElement): void {
    const parentRect = this.parentEl.getBoundingClientRect()
    const parentViewableArea = {
      height: this.parentEl.clientHeight,
      width: this.parentEl.clientWidth,
    }
    const childRect = child.getBoundingClientRect()
    const isChildInView =
      childRect.top >= parentRect.top && childRect.bottom <= parentRect.top + parentViewableArea.height

    if (!isChildInView) {
      const scrollTop = childRect.top - parentRect.top
      const scrollBot = childRect.bottom - parentRect.bottom
      if (Math.abs(scrollTop) < Math.abs(scrollBot)) {
        this.parentEl.scrollTop += scrollTop
      } else {
        this.parentEl.scrollTop += scrollBot
      }
    }
  }

  clickCurrent(): void {
    const currentItem = this.items[this.currentIndex]
    if (currentItem) {
      currentItem.click()
    }
  }
}
