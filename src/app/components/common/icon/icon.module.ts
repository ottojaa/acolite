import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IconComponent } from './icon.component'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [IconComponent],
  exports: [IconComponent],
  imports: [CommonModule, MatIconModule],
})
export class IconModule {}
