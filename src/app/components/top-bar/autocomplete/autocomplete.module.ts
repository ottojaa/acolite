import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AutocompleteComponent } from './autocomplete.component'
import { FormsModule } from '@angular/forms'
import { ClickOutsideModule } from 'ng-click-outside'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { SharedModule } from 'primeng/api'
import { KeyboardEventsModule } from '../../directives/keyboard-events/keyboard-events.module'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatIconModule } from '@angular/material/icon'
import { MatDialogModule } from '@angular/material/dialog'
import { MatMenuModule } from '@angular/material/menu'
import { SearchBuilderDialogModule } from '../../dialogs/search-builder-dialog/search-builder-dialog.module'
import { IconModule } from 'app/components/common/icon/icon.module'
import { FormatDistancePipe } from 'app/components/pipes/format-distance.pipe'
import { FormatDistanceModule } from 'app/components/pipes/format-distance.module'

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
    SearchBuilderDialogModule,
    MatDialogModule,
    KeyboardEventsModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatMenuModule,
    IconModule,
    FormatDistanceModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AutocompleteModule {}
