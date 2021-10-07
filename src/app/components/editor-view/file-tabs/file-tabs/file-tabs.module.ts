import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FileTabsComponent } from './file-tabs.component'
import { MatTabsModule } from '@angular/material/tabs'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [FileTabsComponent],
  exports: [FileTabsComponent],
  imports: [CommonModule, MatTabsModule, MatIconModule],
})
export class FileTabsModule {}
