import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardModule } from 'primeng/card'
import { FileCardComponent } from './file-card.component'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { IconModule } from '../../icon/icon.module'
import { FormatDistanceModule } from 'app/components/pipes/format-distance.module'
import { SkeletonModule } from 'primeng/skeleton'

@NgModule({
  declarations: [FileCardComponent],
  exports: [FileCardComponent],
  imports: [CommonModule, CardModule, MatChipsModule, MatIconModule, IconModule, FormatDistanceModule, SkeletonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FileCardModule {}
