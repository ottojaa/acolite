import { NgModule } from '@angular/core'
import { MonacoThemeSwitcherComponent } from './monaco-theme-switcher.component'
import { AppMaterialModule } from 'app/app-material.module'
import { CommonModule } from '@angular/common'
import { MatSelectModule } from '@angular/material/select'
import { FormsModule } from '@angular/forms'

@NgModule({
  declarations: [MonacoThemeSwitcherComponent],
  exports: [MonacoThemeSwitcherComponent],
  imports: [CommonModule, AppMaterialModule, MatSelectModule, FormsModule],
})
export class MonacoThemeSwitcherModule {}
