import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SideMenuComponent } from './side-menu.component'
import { TreeModule } from 'primeng/tree'
import { TreeDragDropService } from 'primeng/api'
import { ContextMenuModule } from 'primeng/contextmenu'
import { ClickOutsideModule } from 'ng-click-outside'
import { RoundedIconButtonModule } from '../common/rounded-icon-button/rounded-icon-button.module'

@NgModule({
  declarations: [SideMenuComponent],
  exports: [SideMenuComponent],
  providers: [TreeDragDropService],
  imports: [CommonModule, TreeModule, ContextMenuModule, ClickOutsideModule, RoundedIconButtonModule],
})
export class SideMenuModule {}
