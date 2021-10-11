import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PageNotFoundComponent } from './shared/components'

import { BaseDirRoutingModule } from './home/base-directory-routing.module'
import { MainRoutingModule } from './main/main-routing.module'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'base-dir',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    BaseDirRoutingModule,
    MainRoutingModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
