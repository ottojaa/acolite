import { Component, Input, OnInit } from '@angular/core'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, switchMap, take } from 'rxjs/operators'
import { ElectronService } from '../../../../core/services'
import { Tab } from '../../../../interfaces/Menu'
import { StateService } from '../../../../services/state.service'

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit {
  @Input() tab: Tab
  textContent: string
  fontSize = '16px'
  autoSave$ = new Subject()

  constructor(private electronService: ElectronService, private state: StateService) {}

  ngOnInit(): void {
    console.log('called')
    this.textContent = this.tab.textContent
    this.autoSave$
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap(() => this.state.getStatePart('tabs').pipe(take(1)))
      )
      .subscribe((tabs) => {
        console.log('hurraa')
        this.updateContent(tabs, this.tab.path, this.textContent)
      })
  }

  updateContent(tabs: Tab[], path: string, content: string): void {
    const payload = { tabs, path, content }
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
}
