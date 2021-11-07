import { Component, Input, OnInit } from '@angular/core'
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

  constructor() {}

  ngOnInit(): void {
    console.log('editor initialised')
    this.textContent = this.tab.textContent
  }
}
