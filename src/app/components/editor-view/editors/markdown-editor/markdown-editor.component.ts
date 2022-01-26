import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { MarkdownEditorComponent, Options, ToolbarItem, ToolbarItemName } from '@mdefy/ngx-markdown-editor'
import { MarkdownService } from 'ngx-markdown'
import { ElectronService } from '../../../../core/services'
import { StateService } from '../../../../services/state.service'
import { Doc } from '../../../../../../app/shared/interfaces'
import { AbstractEditor } from 'app/abstract/abstract-editor'
import { ToolbarItemDef } from '@mdefy/ngx-markdown-editor/lib/types/toolbar'
import hljs from 'highlight.js/lib/common'

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss'],
})
export class MarkdownEditorViewComponent extends AbstractEditor implements OnInit {
  @Input() tab: Doc

  // Perhaps something to do with animations, but ngxMde is not immediately available on NgOnInit, and
  // there's a small delay between the ngxMde instance being available and the underlying
  // CodeMirror being available. SetTimeOut used as a bandaid fix for this
  @ViewChild(MarkdownEditorComponent) ngxMde: MarkdownEditorComponent

  fileContent: string
  isChecked: boolean
  editorOptions: Options
  viewInit = false
  toolbar: (ToolbarItem | ToolbarItemName)[]

  constructor(
    public state: StateService,
    public electronService: ElectronService,
    private markdownService: MarkdownService
  ) {
    super(electronService, state)
  }

  ngOnInit(): void {
    this.initSelectedTabListener()
    this.initThemeListener()
    this.initMarkdownDefaultBehaviorOverride()
    this.editorOptions = this.getDefaultOptions()
    this.toolbar = this.constructToolbar()
  }

  exportAsPdf(): void {
    console.log('clicked')
  }

  onEditorContentChange(): void {
    if (!this.ngxMde) {
      return
    }
    this.fileContent = this.ngxMde.mde.cm.getValue()
    if (this.viewInit) {
      this.autoSave$.next({ filePath: this.tab.filePath, content: this.fileContent })
    }
    this.viewInit = true
  }

  getDefaultOptions(): Options {
    return {
      highlightTokens: true,
      shortcutsEnabled: 'all',
    }
  }

  /**
   * Workaround for editor value initialisation bug: under the hood, prism.js tries to do highlight checks on the markdown editor
   * even if the editor is hidden by *ngIf, which causes problems if the editor shown on pageload is not a markdown editor.
   * Unsubscribe from the listener after content is set to each CodeMirror instance
   */
  async initfileContentIfNgxMdeInView(): Promise<void> {
    setTimeout(async () => {
      const queryString = `ngx-markdown-editor-${this.tab.filePath}`
      const editor = document.getElementById(queryString)
      if (editor && this.ngxMde) {
        this.ngxMde.mde.setContent(this.tab.fileContent)
        this.initialized$.next(true)
        this.initialized$.unsubscribe()
      }
    })
  }

  constructToolbar(): ToolbarItemDef[] {
    return [
      'setHeadingLevel',
      'toggleHeadingLevel',
      'increaseHeadingLevel',
      'decreaseHeadingLevel',
      'toggleBold',
      'toggleItalic',
      'toggleStrikethrough',
      '|',
      'toggleUnorderedList',
      'toggleOrderedList',
      'toggleCheckList',
      '|',
      'toggleQuote',
      'toggleInlineCode',
      'insertCodeBlock',
      '|',
      'insertLink',
      'insertImageLink',
      'insertTable',
      'insertHorizontalRule',
      '|',
      'toggleRichTextMode',
      'formatContent',
      '|',
      'downloadAsFile',
      'importFromFile',
      '|',
      'togglePreview',
      'toggleSideBySidePreview',
      '|',
      'undo',
      'redo',
      '|',
      'openMarkdownGuide',
      {
        name: 'Export as pdf',
        action: () => this.exportAsPdf(),
        shortcut: 'Alt-B',
        tooltip: 'Export as PDF`',
        icon: {
          format: 'material',
          iconName: 'picture_as_pdf',
        },
      },
    ]
  }

  initMarkdownDefaultBehaviorOverride(): void {
    this.markdownService.renderer.listitem = (text: string) => {
      if (/^\s*\[[x ]\]\s*/.test(text)) {
        text = text
          .replace(/^\s*\[ \]\s*/, '<input type="checkbox"> ')
          .replace(/^\s*\[x\]\s*/, '<input type="checkbox" checked=true> ')
        return '<li style="list-style: none">' + text + '</li>'
      } else {
        return '<li>' + text + '</li>'
      }
    }

    this.markdownService.renderer.code = (code: string) => {
      const highlighted = hljs.highlightAuto(code).value
      return `<pre><code>${highlighted}</code></pre>`
    }
    // webContents.setWindowOpenHandler will not catch the event unless "_blank" is specified
    this.markdownService.renderer.link = (href: string, _title: string, text: string) =>
      `<a href="${href}" target="_blank">${text}</a>`
  }

  private initSelectedTabListener(): void {
    this.selectedTabListener().subscribe(() => this.initfileContentIfNgxMdeInView())
  }

  private initThemeListener(): void {
    this.themeListener().subscribe((data) => (this.isChecked = data === 'light'))
  }
}
