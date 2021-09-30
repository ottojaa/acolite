import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RoundedIconButtonComponent } from './rounded-icon-button.component'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { SharedModule } from 'primeng/api'

@NgModule({
  declarations: [RoundedIconButtonComponent],
  exports: [RoundedIconButtonComponent],
  imports: [CommonModule, ButtonModule, RippleModule, SharedModule],
})
export class RoundedIconButtonModule {}
