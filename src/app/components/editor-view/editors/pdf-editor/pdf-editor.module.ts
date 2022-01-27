import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PdfEditorComponent } from './pdf-editor.component'
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer'
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer-component'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { EditorTopBarModule } from '../editor-top-bar/editor-top-bar.module'

@NgModule({
  declarations: [PdfEditorComponent, PdfViewerComponent],
  exports: [PdfEditorComponent],
  imports: [CommonModule, PdfJsViewerModule, ProgressSpinnerModule, EditorTopBarModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PdfEditorModule {}
