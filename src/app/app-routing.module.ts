import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PageNotFoundComponent } from './shared/components'
import { MainComponent } from './main/main.component'
import { LoaderComponent } from './main/loader/loader.component'
import { MainRoutingModule } from './main/main-routing.module'

const routes: Routes = [
  {
    path: '',
    component: LoaderComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
  {
    path: 'main',
    component: MainComponent,
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }), MainRoutingModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
