import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardModule } from 'primeng/card'
import { FileCardComponent } from './file-card.component'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { IconModule } from '../../icon/icon.module'
import { FormatDistanceModule } from 'app/components/pipes/format-distance.module'
import { SkeletonModule } from 'primeng/skeleton'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { NgLetModule } from 'app/components/directives/ng-let.module'

@NgModule({
  declarations: [FileCardComponent],
  exports: [FileCardComponent],
  imports: [
    CommonModule,
    CardModule,
    MatChipsModule,
    MatIconModule,
    IconModule,
    FormatDistanceModule,
    SkeletonModule,
    MatProgressSpinnerModule,
    NgLetModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FileCardModule {}
