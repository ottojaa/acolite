import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { AbstractEditor } from 'app/abstract/abstract-editor'
import { ElectronService } from 'app/core/services'
import { StateService } from 'app/services/state.service'
import { Doc } from '../../../../../../app/shared/interfaces'

@Component({
  selector: 'app-pdf-editor',
  templateUrl: './pdf-editor.component.html',
  styleUrls: ['./pdf-editor.component.scss'],
})
export class PdfEditorComponent extends AbstractEditor {
  @Input() set tab(tab: Doc) {
    this._tab = tab
    this.lastModified = this.tab.modifiedAt
    this.initData()
  }

  _tab: Doc

  get tab(): Doc {
    return this._tab
  }

  pdfFile: Uint8Array

  constructor(public electronService: ElectronService, public state: StateService, private cdRef: ChangeDetectorRef) {
    super(electronService, state)
  }

  async initData(): Promise<void> {
    this.pdfFile = this.convertBase64ToByteArray(this.tab.fileContent)
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
