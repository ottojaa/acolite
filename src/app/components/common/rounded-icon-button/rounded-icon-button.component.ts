import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { TooltipPosition } from '@angular/material/tooltip'

@Component({
  selector: 'app-rounded-icon-button',
  templateUrl: './rounded-icon-button.component.html',
  styleUrls: ['./rounded-icon-button.component.scss'],
})
export class RoundedIconButtonComponent {
  @Input() icon: string
  @Input() tooltip: string
  @Input() scale? = 1
  @Input() position?: TooltipPosition = 'right'
  @Output() onClick: EventEmitter<void> = new EventEmitter()

  className: string

  handleClick(): void {
    this.onClick.emit()
  }
}
