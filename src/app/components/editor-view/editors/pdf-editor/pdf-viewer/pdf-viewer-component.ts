import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-pdf-viewer',
  template: '<ng2-pdfjs-viewer [pdfSrc]="pdfFile"></ng2-pdfjs-viewer>',
})
export class PdfViewerComponent {
  @Input() pdfFile: Uint8Array

  constructor() {}
}
