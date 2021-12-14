import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FieldsetModule } from 'primeng/fieldset'
import { DashboardContentComponent } from './dashboard-content.component'
import { SortableFileTableModule } from './components/sortable-file-table/sortable-file-table.module'
import { FileCardsModule } from './components/file-cards/file-cards.module'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [DashboardContentComponent],
  exports: [DashboardContentComponent],
  imports: [
    CommonModule,
    FieldsetModule,
    SortableFileTableModule,
    FileCardsModule,
    MatProgressBarModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatIconModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardContentModule {}
