import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EditorTopBarModule } from '../editor-top-bar/editor-top-bar.module'
import { ImageEditorComponent } from './image-editor.component'
import { ImageCropperModule } from 'ngx-image-cropper'
import { SafeUrlPipeModule } from 'app/components/pipes/safe-url.pipe.module'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { MatListModule } from '@angular/material/list'
import { FormatFileSizePipeModule } from 'app/components/pipes/format-file-size.module'
import { MatButtonModule } from '@angular/material/button'
import { MatSliderModule } from '@angular/material/slider'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatSelectModule } from '@angular/material/select'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { RoundedIconButtonModule } from 'app/components/common/rounded-icon-button/rounded-icon-button.module'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [ImageEditorComponent],
  exports: [ImageEditorComponent],
  imports: [
    CommonModule,
    EditorTopBarModule,
    ImageCropperModule,
    SafeUrlPipeModule,
    ProgressSpinnerModule,
    MatListModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    FormatFileSizePipeModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSliderModule,
    MatSelectModule,
    MatDividerModule,
    MatCheckboxModule,
    RoundedIconButtonModule,
    MatIconModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ImageEditorModule {}
