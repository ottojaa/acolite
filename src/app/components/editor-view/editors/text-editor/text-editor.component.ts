import { Component, Input, OnInit } from '@angular/core'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { Tab } from '../../../../interfaces/Menu'

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

  constructor() {}

  ngOnInit(): void {
    this.textContent = this.tab.textContent
    this.autoSave$.pipe(debounceTime(2000)).subscribe((data) => {})
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
