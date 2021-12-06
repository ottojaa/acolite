import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SkeletonCardsComponent } from './skeleton-cards.component'
import { SkeletonModule } from 'primeng/skeleton'

@NgModule({
  declarations: [SkeletonCardsComponent],
  exports: [SkeletonCardsComponent],
  imports: [CommonModule, SkeletonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SkeletonCardsModule {}
