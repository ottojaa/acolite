import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DefaultViewComponent } from './default-view.component'
import { FileCardModule } from '../common/file-card/file-card/file-card.module'

@NgModule({
  declarations: [DefaultViewComponent],
  exports: [DefaultViewComponent],
  imports: [CommonModule, FileCardModule],
})
export class DefaultViewModule {}
