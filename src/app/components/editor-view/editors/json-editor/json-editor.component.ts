import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core'
import { CodemirrorComponent } from '@ctrl/ngx-codemirror'
import { IOutputAreaSizes } from 'angular-split'
import { AbstractEditor } from 'app/abstract/abstract-editor'
import hljs from 'highlight.js/lib/common'
import { Doc } from '../../../../../../app/shared/interfaces'
import { ElectronService } from '../../../../core/services'
import { StateService } from '../../../../services/state.service'
import { JsonFormatterComponent } from './json-formatter/json-formatter.component'

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss'],
})
export class JsonEditorComponent extends AbstractEditor implements OnInit {
  @Input() tab: Doc
  @ViewChild('jsonFormatter') jsonFormatter: JsonFormatterComponent
  @ViewChild('codeMirror') codeMirror: CodemirrorComponent

  isChecked: boolean
  fileContent: string
  formattedResult: object
  highlightedContent: any
  isValidJson: boolean
  previewMode: 'json' | 'raw' = 'json'
  openCount = 1
  previewWidth = 0
  editorWidth = 100

  get filePath(): string {
    return this.tab.filePath
  }

  constructor(public electronService: ElectronService, public state: StateService, public cdRef: ChangeDetectorRef) {
    super(electronService, state)
  }

  ngOnInit(): void {
    this.fileContent = this.tab.fileContent
    this.initThemeListener()
    this.initSelectedTabListener()
    this.updateJSONPreview(this.fileContent)
  }

  hidePreview(): void {
    this.previewWidth = 0
    this.editorWidth = 100
  }

  showPreview(): void {
    this.previewWidth = 40
    this.editorWidth = 100
  }

  onSaveHotkeyPress(): void {
    this.lint()
  }

  onDragEnd(event: { sizes: IOutputAreaSizes }): void {
    const [editorWidth, previewWidth] = event.sizes
    this.editorWidth = editorWidth as number
    this.previewWidth = previewWidth as number
  }

  async updateJSONPreview(content: string): Promise<void> {
    const formatted = this.formatJSON(content)
    this.isValidJson = !!formatted

    if (this.isValidJson) {
      this.formattedResult = { ...formatted }
      const highlighted = hljs.highlightAuto(content).value
      this.highlightedContent = `<pre><code class="raw-json">${highlighted}</code></pre>`
    }
  }

  onInputChange(event: any): void {
    this.autoSave$.next({ filePath: this.filePath, content: event })
    this.updateJSONPreview(event)
  }

  formatJSON(fileContent: string): object {
    try {
      return JSON.parse(fileContent)
    } catch {
      return null
    }
  }

  lint(): void {
    try {
      const replaced = this.fileContent.replace(/\'/g, '"')
      const textJson = JSON.parse(replaced)
      if (textJson) {
        this.fileContent = JSON.stringify(textJson, null, 4)
        this.saveContent({ filePath: this.filePath, content: this.fileContent })
        this.updateJSONPreview(replaced)
      }
    } catch {}
  }

  initContentIfInView(): void {
    setTimeout(async () => {
      const queryString = `ngx-codemirror-${this.tab.filePath}`
      const editor = document.getElementById(queryString)
      if (editor && this.codeMirror) {
        this.codeMirror.codeMirror.setValue(this.tab.fileContent)
        this.initialized$.next(true)
        this.initialized$.unsubscribe()
      }
    })
  }

  private initThemeListener(): void {
    this.themeListener().subscribe((data) => (this.isChecked = data === 'light'))
  }

  private initSelectedTabListener(): void {
    this.selectedTabListener().subscribe(() => this.initContentIfInView())
  }
}
