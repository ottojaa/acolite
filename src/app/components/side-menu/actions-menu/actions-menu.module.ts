import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActionsMenuComponent } from './actions-menu.component'
import { RoundedIconButtonModule } from 'app/components/common/rounded-icon-button/rounded-icon-button.module'

@NgModule({
  declarations: [ActionsMenuComponent],
  exports: [ActionsMenuComponent],
  imports: [CommonModule, RoundedIconButtonModule],
})
export class ActionsMenuModule {}
