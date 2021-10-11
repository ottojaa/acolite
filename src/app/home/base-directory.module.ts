import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { BaseDirRoutingModule } from './base-directory-routing.module'

import { BaseDirectoryComponent } from './base-directory.component'
import { SharedModule } from '../shared/shared.module'

@NgModule({
  declarations: [BaseDirectoryComponent],
  imports: [CommonModule, SharedModule, BaseDirRoutingModule],
})
export class HomeModule {}
