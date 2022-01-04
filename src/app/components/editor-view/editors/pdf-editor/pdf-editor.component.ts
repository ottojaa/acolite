import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { Doc } from '../../../../../../app/shared/interfaces'

@Component({
  selector: 'app-pdf-editor',
  templateUrl: './pdf-editor.component.html',
  styleUrls: ['./pdf-editor.component.scss'],
})
export class PdfEditorComponent {
  @Input() set tab(tab: Doc) {
    this._tab = tab
    this.initData()
  }

  _tab: Doc

  get tab(): Doc {
    return this._tab
  }

  pdfFile: Uint8Array

  constructor(private electronService: ElectronService, private cdRef: ChangeDetectorRef) {}

  async initData(): Promise<void> {
    const imagePath = await this.electronService.getImageData({ filePath: this.tab.filePath })
    this.pdfFile = this.convertBase64ToByteArray(imagePath)
    this.cdRef.detectChanges()
  }

  convertBase64ToByteArray(b64Data: string) {
    const byteCharacters = atob(b64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return byteArray
  }
}
