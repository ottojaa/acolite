import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FileCardModule } from '../../../common/file-card/file-card/file-card.module'
import { FileTabsModule } from './../../file-tabs/file-tabs/file-tabs.module'

@NgModule({
  declarations: [],
  imports: [CommonModule, FileCardModule, FileTabsModule],
})
export class DefaultPageModule {}
