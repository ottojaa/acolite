import { NgModule } from '@angular/core'
import { ThemeSwitcherComponent } from './theme-switcher.component'
import { AppMaterialModule } from '../../../app-material.module'
import { CommonModule } from '@angular/common'

@NgModule({
  declarations: [ThemeSwitcherComponent],
  exports: [ThemeSwitcherComponent],
  imports: [CommonModule, AppMaterialModule],
})
export class ThemeSwitcherModule {}
