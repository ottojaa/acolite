import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SideMenuComponent } from './side-menu.component'
import { TreeDragDropService } from 'primeng/api'
import { RoundedIconButtonModule } from '../common/rounded-icon-button/rounded-icon-button.module'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { FileTreeModule } from './tree/tree.module'

@NgModule({
  declarations: [SideMenuComponent],
  exports: [SideMenuComponent],
  providers: [TreeDragDropService],
  imports: [CommonModule, RoundedIconButtonModule, MatProgressBarModule, FileTreeModule],
})
export class SideMenuModule {}
