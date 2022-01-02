import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PdfEditorComponent } from './pdf-editor.component'
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer-component'
import { ProgressSpinnerModule } from 'primeng/progressspinner'

@NgModule({
  declarations: [PdfEditorComponent, PdfViewerComponent],
  exports: [PdfEditorComponent],
  imports: [CommonModule, PdfJsViewerModule, ProgressSpinnerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PdfEditorModule {}
