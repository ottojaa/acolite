import { Component, Input, OnInit, ViewChild } from '@angular/core'
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

  isChecked: boolean
  textContent: string
  formattedResult: Object
  highlightedContent: any
  isValidJson: boolean
  previewMode: 'json' | 'raw' = 'json'
  openCount = 1
  viewInit = false
  previewWidth = 40
  editorWidth = 60

  get filePath(): string {
    return this.tab.filePath
  }

  constructor(public electronService: ElectronService, public state: StateService) {
    super(electronService, state)
  }

  ngOnInit(): void {
    this.textContent = this.tab.textContent
    this.initThemeListener()
    this.updateJSONPreview(this.textContent)
  }

  ngAfterViewInit(): void {
    this.viewInit = true
  }

  hidePreview(): void {
    this.previewWidth = 0
    this.editorWidth = 100
  }

  showPreview(): void {
    this.previewWidth = 40
    this.editorWidth = 100
  }

  onDragEnd(event: { sizes: IOutputAreaSizes }): void {
    const [editorWidth, previewWidth] = event.sizes
    this.editorWidth = editorWidth as number
    this.previewWidth = previewWidth as number
  }

  updateJSONPreview(content: string): void {
    const formatted = this.formatJSON(content)
    this.isValidJson = !!formatted

    if (this.isValidJson) {
      this.formattedResult = { ...formatted }
      const highlighted = hljs.highlightAuto(content)
      this.highlightedContent = `<pre><code class="raw-json">${highlighted.value}</code></pre>`
    }
  }

  onInputChange(): void {
    this.autoSave$.next({ filePath: this.filePath, content: this.textContent })
    this.updateJSONPreview(this.textContent)
  }

  formatJSON(textContent: string): Object {
    try {
      return JSON.parse(textContent)
    } catch {
      return null
    }
  }

  lint(): void {
    try {
      const textJson = JSON.parse(this.textContent)
      if (textJson) {
        this.autoSave$.next({ filePath: this.filePath, content: this.textContent })
        this.textContent = JSON.stringify(textJson, null, 4)
        this.updateJSONPreview(this.textContent)
      }
    } catch {}
  }

  private initThemeListener(): void {
    this.themeListener().subscribe((data) => (this.isChecked = data === 'light'))
  }

  private initSelectedTabListener(): void {
    this.selectedTabListener().subscribe(() => this.initContentIfInView())
  }

  initContentIfInView(): void {
    this.textContent = this.tab.textContent
  }
}
