import { Component, Input, OnInit } from '@angular/core'
import { MenuItem } from 'primeng/api'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators'
import { Doc } from '../../../../../../app/shared/interfaces'
import { AbstractComponent } from '../../../../abstract/abstract-component'
import { ElectronService } from '../../../../core/services'
import { StateService } from '../../../../services/state.service'

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent extends AbstractComponent implements OnInit {
  @Input() tab: Doc

  isChecked: boolean
  textContent: string
  rand = new Date()
  autoSave$ = new Subject()
  currentSelection: any
  menuItems: MenuItem[]

  constructor(private electronService: ElectronService, private state: StateService) {
    super()
  }

  ngOnInit(): void {
    this.textContent = this.tab.textContent
    this.menuItems = this.getMenuItems()
    this.initAutoSave()
    this.initThemeListener()
  }

  initAutoSave(): void {
    this.autoSave$.pipe(takeUntil(this.destroy$), debounceTime(1000), distinctUntilChanged()).subscribe(() => {
      this.updateContent(this.tab.filePath, this.textContent)
    })
  }

  initThemeListener(): void {
    this.state
      .getStatePart('editorTheme')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.isChecked = data === 'light'))
  }

  updateContent(filePath: string, content: string): void {
    const payload = { filePath, content, state: this.state.value }
    this.electronService.updateFileContent(payload)
  }

  onInputChange(): void {
    this.autoSave$.next(this.textContent)
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
}
