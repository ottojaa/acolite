import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

@Component({
  selector: 'app-rounded-icon-button',
  templateUrl: './rounded-icon-button.component.html',
  styleUrls: ['./rounded-icon-button.component.scss'],
})
export class RoundedIconButtonComponent implements OnInit {
  @Input() icon: string
  @Output() onClick: EventEmitter<void> = new EventEmitter()

  className: string
  constructor() {}

  ngOnInit(): void {
    this.className = `pi pi-icon-` + this.icon
  }

  handleClick(): void {
    this.onClick.emit()
  }
}
