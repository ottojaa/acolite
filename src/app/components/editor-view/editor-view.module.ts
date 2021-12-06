import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EditorViewComponent } from './editor-view.component'
import { FileTabsModule } from './file-tabs/file-tabs/file-tabs.module'
import { FileCardModule } from '../common/file-card/file-card/file-card.module'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { FileCardsModule } from './file-cards/file-cards/file-cards.module'

@NgModule({
  declarations: [EditorViewComponent],
  exports: [EditorViewComponent],
  imports: [CommonModule, FileTabsModule, FileCardModule, ProgressSpinnerModule, FileCardsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditorViewModule {}
