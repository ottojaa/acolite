import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AutocompleteComponent } from './autocomplete.component'
import { FormsModule } from '@angular/forms'
import { ClickOutsideModule } from 'ng-click-outside'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { SharedModule } from 'primeng/api'
import { KeyboardEventsModule } from '../../directives/keyboard-events/keyboard-events.module'

@NgModule({
  declarations: [AutocompleteComponent],
  exports: [AutocompleteComponent],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ClickOutsideModule,
    ButtonModule,
    RippleModule,
    KeyboardEventsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AutocompleteModule {}
