import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { MenuItem } from 'primeng/api'
import { interval, Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, startWith, switchMap, take, takeUntil } from 'rxjs/operators'
import { getDistance } from '../../../../../../app/date-and-time-helpers'
import { AbstractComponent } from '../../../../abstract/abstract-component'
import { ElectronService } from '../../../../core/services'
import { Tab } from '../../../../interfaces/Menu'
import { StateService } from '../../../../services/state.service'

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent extends AbstractComponent implements OnInit {
  @Input() tab: Tab

  isChecked: boolean
  textContent: string
  rand = new Date()
  lastUpdated: string
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
    this.initUpdateTimeListener()
    this.initThemeListener()
  }

  initAutoSave(): void {
    this.autoSave$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap(() => this.state.getStatePart('tabs').pipe(take(1)))
      )
      .subscribe((tabs) => {
        this.updateContent(tabs, this.tab.path, this.textContent)
        this.lastUpdated = getDistance(this.tab.modifiedAt)
      })
  }

  initThemeListener(): void {
    this.state
      .getStatePart('editorTheme')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.isChecked = data === 'light'))
  }

  updateContent(tabs: Tab[], path: string, content: string): void {
    const payload = { tabs, path, content }
    this.electronService.updateFileContent(payload)
  }

  initUpdateTimeListener(): void {
    interval(1000)
      .pipe(startWith(0))
      .subscribe(() => {
        this.lastUpdated = getDistance(this.tab.modifiedAt)
      })
  }

  onInputChange(): void {
    this.autoSave$.next(this.textContent)
  }

  onChangeTheme(): void {
    const theme = this.isChecked ? 'light' : 'dark'
    this.state.updateState$.next({ key: 'editorTheme', payload: theme })
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
