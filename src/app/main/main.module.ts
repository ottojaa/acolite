import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MainRoutingModule } from './main-routing.module'

import { SharedModule } from '../shared/shared.module'
import { MainComponent } from './main.component'
import { SideMenuModule } from '../components/side-menu/side-menu.module'
import { TopBarModule } from '../components/top-bar/top-bar/top-bar.module'
import { DefaultViewModule } from '../components/default-view/default-view.module'
import { AngularSplitModule } from 'angular-split'
import { PanelModule } from 'primeng/panel'
import { BrowserModule } from '@angular/platform-browser'
import { ProgressSpinnerModule } from 'primeng/progressspinner'

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    SharedModule,
    MainRoutingModule,
    SideMenuModule,
    TopBarModule,
    DefaultViewModule,
    AngularSplitModule,
    PanelModule,
    BrowserModule,
    ProgressSpinnerModule,
  ],
})
export class DetailModule {}
