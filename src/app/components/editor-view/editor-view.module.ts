import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EditorViewComponent } from './editor-view.component'
import { FileTabsModule } from './file-tabs/file-tabs/file-tabs.module'
import { FileCardModule } from '../common/file-card/file-card/file-card.module'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { FileCardsModule } from './dashboard-content/components/file-cards/file-cards.module'
import { MatTabsModule } from '@angular/material/tabs'
import { MatListModule } from '@angular/material/list'
import { SortableFileTableModule } from './dashboard-content/components/sortable-file-table/sortable-file-table.module'
import { DashboardContentModule } from './dashboard-content/dashboard-content.module'
import { MatProgressBarModule } from '@angular/material/progress-bar'

@NgModule({
  declarations: [EditorViewComponent],
  exports: [EditorViewComponent],
  imports: [
    CommonModule,
    FileTabsModule,
    FileCardModule,
    ProgressSpinnerModule,
    FileCardsModule,
    MatTabsModule,
    MatListModule,
    SortableFileTableModule,
    DashboardContentModule,
    MatProgressBarModule,
  ],
})
export class EditorViewModule {}
