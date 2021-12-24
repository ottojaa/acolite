import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RoundedIconButtonComponent } from './rounded-icon-button.component'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { SharedModule } from 'primeng/api'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatButtonModule } from '@angular/material/button'

@NgModule({
  declarations: [RoundedIconButtonComponent],
  exports: [RoundedIconButtonComponent],
  imports: [CommonModule, ButtonModule, RippleModule, SharedModule, MatButtonModule, MatIconModule, MatTooltipModule],
})
export class RoundedIconButtonModule {}
