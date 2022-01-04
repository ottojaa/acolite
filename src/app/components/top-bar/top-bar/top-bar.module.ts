import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TopBarComponent } from './top-bar.component'
import { MenubarModule } from 'primeng/menubar'
import { SharedModule } from 'primeng/api'
import { InputTextModule } from 'primeng/inputtext'
import { RoundedIconButtonModule } from '../../common/rounded-icon-button/rounded-icon-button.module'
import { ThemeSwitcherModule } from '../theme-switcher/theme-switcher.module'
import { FormsModule } from '@angular/forms'
import { AutocompleteModule } from '../autocomplete/autocomplete.module'
import { MatTooltipModule } from '@angular/material/tooltip'

@NgModule({
  declarations: [TopBarComponent],
  exports: [TopBarComponent],
  imports: [
    FormsModule,
    CommonModule,
    MenubarModule,
    ThemeSwitcherModule,
    AutocompleteModule,
    SharedModule,
    InputTextModule,
    RoundedIconButtonModule,
    MatTooltipModule,
  ],
})
export class TopBarModule {}
