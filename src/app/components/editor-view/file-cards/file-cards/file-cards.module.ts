import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SkeletonCardsModule } from 'app/components/common/skeleton-cards/skeleton-cards.module'
import { LoaderModule } from 'app/components/common/fade/fade.module'
import { FileCardsComponent } from './file-cards.component'
import { FileCardModule } from 'app/components/common/file-card/file-card/file-card.module'

@NgModule({
  declarations: [FileCardsComponent],
  exports: [FileCardsComponent],
  imports: [CommonModule, SkeletonCardsModule, LoaderModule, FileCardModule],
})
export class FileCardsModule {}
