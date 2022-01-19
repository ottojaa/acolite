import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { JsonEditorComponent } from './json-editor.component'
import { ContextMenuModule } from 'primeng/contextmenu'
import { EditorTopBarModule } from '../editor-top-bar/editor-top-bar.module'
import { TextFieldModule } from '@angular/cdk/text-field'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { JsonFormatterModule } from './json-formatter/json-formatter.module'
import { AngularSplitModule } from 'angular-split'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { CodemirrorModule } from '@ctrl/ngx-codemirror'
import { KeyboardEventsModule } from 'app/components/directives/keyboard-events.module'

@NgModule({
  declarations: [JsonEditorComponent],
  exports: [JsonEditorComponent],
  imports: [
    CommonModule,
    ContextMenuModule,
    EditorTopBarModule,
    TextFieldModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    JsonFormatterModule,
    AngularSplitModule,
    MatButtonToggleModule,
    CodemirrorModule,
    KeyboardEventsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class JsonEditorModule {}
