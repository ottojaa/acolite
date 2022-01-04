import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { MarkdownEditorComponent, Options } from '@mdefy/ngx-markdown-editor'
import { MarkdownService } from 'ngx-markdown'
import { Subject } from 'rxjs'
import { debounceTime, skip, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../../../../abstract/abstract-component'
import { ElectronService } from '../../../../core/services'
import { StateService } from '../../../../services/state.service'
import hljs from 'highlight.js/lib/common'
import { Doc } from '../../../../../../app/shared/interfaces'
import { AbstractEditor } from 'app/abstract/abstract-editor'

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

  textContent: string
  isChecked: boolean
  editorOptions: Options
  viewInit = false

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
  }

  /*  async initTabData(): Promise<void> {
    const data = await this.electronService.getFileData({ filePath: this.tab.filePath })
  } */

  onEditorContentChange(): void {
    if (!this.ngxMde) {
      return
    }
    this.textContent = this.ngxMde.mde.cm.getValue()
    if (this.viewInit) {
      this.autoSave$.next({ filePath: this.tab.filePath, content: this.textContent })
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
  initTextContentIfNgxMdeInView(): void {
    setTimeout(() => {
      const queryString = `ngx-markdown-editor-${this.tab.filePath}`
      const editor = document.getElementById(queryString)
      if (editor && this.ngxMde) {
        this.ngxMde.mde.setContent(this.tab.textContent)
        this.initialized$.next(true)
        this.initialized$.unsubscribe()
      }
    })
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
      const highlighted = hljs.highlightAuto(code)
      return `<pre><code>${highlighted.value}</code></pre>`
    }
    // webContents.setWindowOpenHandler will not catch the event unless "_blank" is specified
    this.markdownService.renderer.link = (href: string, _title: string, text: string) =>
      `<a href="${href}" target="_blank">${text}</a>`
  }

  private initSelectedTabListener(): void {
    this.selectedTabListener().subscribe(() => this.initTextContentIfNgxMdeInView())
  }

  private initThemeListener(): void {
    this.themeListener().subscribe((data) => (this.isChecked = data === 'light'))
  }
}
