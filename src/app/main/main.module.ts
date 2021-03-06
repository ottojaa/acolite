import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from '../shared/shared.module'
import { MainComponent } from './main.component'
import { SideMenuModule } from '../components/side-menu/side-menu.module'
import { TopBarModule } from '../components/top-bar/top-bar/top-bar.module'
import { EditorViewModule } from '../components/editor-view/editor-view.module'
import { AngularSplitModule } from 'angular-split'
import { PanelModule } from 'primeng/panel'
import { BrowserModule } from '@angular/platform-browser'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { ActionsMenuModule } from 'app/components/side-menu/actions-menu/actions-menu.module'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    SharedModule,
    SideMenuModule,
    TopBarModule,
    EditorViewModule,
    AngularSplitModule,
    PanelModule,
    BrowserModule,
    ProgressSpinnerModule,
    BrowserAnimationsModule,
    ActionsMenuModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DetailModule {}
