import { Component, Input, OnInit } from '@angular/core'
import { AbstractEditor } from 'app/abstract/abstract-editor'
import { Doc } from '../../../../../../app/shared/interfaces'
import { ElectronService } from '../../../../core/services'
import { StateService } from '../../../../services/state.service'

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent extends AbstractEditor implements OnInit {
  @Input() tab: Doc

  isChecked: boolean
  fileContent: string

  get filePath(): string {
    return this.tab.filePath
  }

  constructor(public electronService: ElectronService, public state: StateService) {
    super(electronService, state)
  }

  ngOnInit(): void {
    this.initfileContent()
    this.initThemeListener()
  }

  onInputChange(): void {
    this.autoSave$.next({ filePath: this.filePath, content: this.fileContent })
  }

  async initfileContent(): Promise<void> {
    this.fileContent = this.tab.fileContent
    console.log(this.fileContent)
  }

  private initThemeListener(): void {
    this.themeListener().subscribe((data) => (this.isChecked = data === 'light'))
  }

  handleKeydown(event: any) {
    if (event.key == 'Tab') {
      event.preventDefault()
      let start = event.target.selectionStart
      let end = event.target.selectionEnd
      if (event.shiftKey) {
        if (event.target.value.substring(start - 1, start) !== '\t') {
          return
        }
        event.target.value = event.target.value.substring(0, start - 1) + event.target.value.substring(end)
        event.target.selectionStart = event.target.selectionEnd = start - 1
      } else {
        event.target.value = event.target.value.substring(0, start) + '\t' + event.target.value.substring(end)
        event.target.selectionStart = event.target.selectionEnd = start + 1
      }
    }
  }
}
