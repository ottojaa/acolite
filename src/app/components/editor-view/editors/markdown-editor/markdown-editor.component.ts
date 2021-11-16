import { Component, Input, OnInit } from '@angular/core'
import { Tab } from '../../../../interfaces/Menu'

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss'],
})
export class MarkdownEditorComponent implements OnInit {
  @Input() tab: Tab

  constructor() {}

  ngOnInit(): void {}
}
