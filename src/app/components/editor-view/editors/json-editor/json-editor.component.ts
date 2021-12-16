import { Component, Input, OnInit } from '@angular/core'
import { AbstractEditor } from 'app/abstract/abstract-editor'
import hljs from 'highlight.js/lib/common'
import { MenuItem } from 'primeng/api'
import { Doc } from '../../../../../../app/shared/interfaces'
import { ElectronService } from '../../../../core/services'
import { StateService } from '../../../../services/state.service'

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss'],
})
export class JsonEditorComponent extends AbstractEditor implements OnInit {
  @Input() tab: Doc

  isChecked: boolean
  textContent: string
  rand = new Date()
  currentSelection: any
  menuItems: MenuItem[]
  formattedResult: string
  highlightedContent: any
  isValidJson: boolean
  previewMode: 'json' | 'raw' = 'json'

  get filePath(): string {
    return this.tab.filePath
  }

  constructor(public electronService: ElectronService, public state: StateService) {
    super(electronService, state)
  }

  ngOnInit(): void {
    this.textContent = this.tab.textContent
    this.menuItems = this.getMenuItems()
    this.initThemeListener()
    this.updateJSONPreview(this.textContent)
  }

  updateJSONPreview(content: string): void {
    const formatted = this.formatJSON(content)
    this.isValidJson = !!formatted

    if (this.isValidJson) {
      this.formattedResult = formatted
      const highlighted = hljs.highlightAuto(content)
      this.highlightedContent = `<pre><code class="raw-json">${highlighted.value}</code></pre>`
    }
  }

  onInputChange(): void {
    this.autoSave$.next({ filePath: this.filePath, content: this.textContent })
    this.updateJSONPreview(this.textContent)
  }

  formatJSON(textContent: string): string {
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

  getMenuItems(): any {
    return [
      {
        label: 'Copy',
        icon: 'pi pi-copy',
        command: () => this.eventHandler('copy'),
      },
      {
        label: 'Paste',
        icon: 'pi pi-file-o',
        command: () => this.eventHandler('paste'),
      },
      {
        label: 'Cut',
        icon: 'pi pi-pencil',
        command: () => this.eventHandler('cut'),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.eventHandler('delete'),
      },
    ]
  }

  onRightClickTextArea(): void {
    this.currentSelection = document.activeElement
  }

  async eventHandler(type: 'copy' | 'paste' | 'cut' | 'delete'): Promise<void> {
    const actElem: any = this.currentSelection
    const actTagName = actElem.tagName
    if (actTagName != 'TEXTAREA') {
      return
    }

    navigator.clipboard.readText().then((paste) => {
      switch (type) {
        case 'copy':
          const selection = actElem.value
          navigator.clipboard.writeText(selection).then(() => {})
          break
        case 'paste': {
          const actText = actElem.value
          actElem.value = actText.slice(0, actElem.selectionStart) + paste + actText.slice(actElem.selectionEnd)
          break
        }

        case 'cut': {
          const actText = actElem.value
          const cutText = actText.slice(actElem.selectionStart, actElem.selectionEnd)
          navigator.clipboard.writeText(cutText).then(() => {
            actElem.value = actText.slice(0, actElem.selectionStart) + actText.slice(actElem.selectionEnd)
          })
          break
        }

        case 'delete': {
          const actText = actElem.value
          actElem.value = actText.slice(0, actElem.selectionStart) + actText.slice(actElem.selectionEnd)
          break
        }
      }
    })
  }

  private initThemeListener(): void {
    this.themeListener().subscribe((data) => (this.isChecked = data === 'light'))
  }
}
