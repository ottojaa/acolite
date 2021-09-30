import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TopBarComponent } from './top-bar.component'
import { MenubarModule } from 'primeng/menubar'
import { MenuItem, SharedModule } from 'primeng/api'
import { InputTextModule } from 'primeng/inputtext'
import { RoundedIconButtonModule } from '../../common/rounded-icon-button/rounded-icon-button.module'
import { ThemeSwitcherModule } from '../theme-switcher/theme-switcher.module'
import { FormsModule } from '@angular/forms'
import { AutocompleteModule } from '../autocomplete/autocomplete.module'

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
  ],
})
export class TopBarModule {
  items: MenuItem[]

  ngOnInit() {
    this.items = [
      {
        label: 'File',
        items: [
          {
            label: 'New',
            icon: 'pi pi-fw pi-plus',
            items: [{ label: 'Project' }, { label: 'Other' }],
          },
          { label: 'Open' },
          { label: 'Quit' },
        ],
      },
      {
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        items: [
          { label: 'Delete', icon: 'pi pi-fw pi-trash' },
          { label: 'Refresh', icon: 'pi pi-fw pi-refresh' },
        ],
      },
    ]
  }
}
