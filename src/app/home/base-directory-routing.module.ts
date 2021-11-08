import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'
import { BaseDirectoryComponent } from './base-directory.component'

const routes: Routes = [
  {
    path: 'base-dir',
    component: BaseDirectoryComponent,
  },
]

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaseDirRoutingModule {}
