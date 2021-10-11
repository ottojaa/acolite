import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'
import { BaseDirectoryComponent } from './base-directory.component'
import { BaseDirGuard } from '../services/base-dir-guard.service'

const routes: Routes = [
  {
    path: 'base-dir',
    component: BaseDirectoryComponent,
    canActivate: [BaseDirGuard],
  },
]

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  providers: [BaseDirGuard],
  exports: [RouterModule],
})
export class BaseDirRoutingModule {}
