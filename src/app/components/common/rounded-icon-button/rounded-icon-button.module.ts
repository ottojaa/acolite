import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RoundedIconButtonComponent } from './rounded-icon-button.component'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { SharedModule } from 'primeng/api'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'

@NgModule({
  declarations: [RoundedIconButtonComponent],
  exports: [RoundedIconButtonComponent],
  imports: [CommonModule, ButtonModule, RippleModule, SharedModule, MatIconModule, MatTooltipModule],
})
export class RoundedIconButtonModule {}
