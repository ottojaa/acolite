import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardModule } from 'primeng/card'
import { FileCardComponent } from './file-card.component'
import { MatChipsModule } from '@angular/material/chips'

@NgModule({
  declarations: [FileCardComponent],
  exports: [FileCardComponent],
  imports: [CommonModule, CardModule, MatChipsModule],
})
export class FileCardModule {}
