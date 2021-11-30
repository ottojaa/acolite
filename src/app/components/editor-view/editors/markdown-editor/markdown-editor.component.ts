import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core'
import { MarkdownEditorComponent } from '@mdefy/ngx-markdown-editor'
import { MarkdownService } from 'ngx-markdown'
import { Subject } from 'rxjs'
import { debounceTime, skip, switchMap, take, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../../../../abstract/abstract-component'
import { ElectronService } from '../../../../core/services'
import { Tab } from '../../../../interfaces/Menu'
import { StateService } from '../../../../services/state.service'

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownEditorViewComponent extends AbstractComponent implements OnInit {
  @Input() tab: Tab

  // Perhaps something to do with animations, but ngxMde is not immediately available on NgOnInit, and
  // there's a small delay between the ngxMde instance being available and the underlying
  // CodeMirror being available. SetTimeOut used as a bandaid fix for this
  @ViewChild(MarkdownEditorComponent) ngxMde: MarkdownEditorComponent

  public autoSave$ = new Subject()
  textContent: string
  isChecked: boolean
  initialized$ = new Subject<boolean>()

  constructor(
    public state: StateService,
    public electronService: ElectronService,
    private markdownService: MarkdownService
  ) {
    super()
  }

  ngOnInit(): void {
    this.initSelectedTabListener()
    this.initAutoSave()
    this.initThemeListener()
    this.initMarkdownDefaultBehaviorOverride()
  }

  onEditorContentChange(): void {
    if (!this.ngxMde) {
      return
    }
    this.textContent = this.ngxMde.mde.cm.getValue()
    this.autoSave$.next()
  }

  /**
   * Workaround for editor value initialisation bug: under the hood, prism.js tries to do highlight checks on the markdown editor
   * even if the editor is hidden by *ngIf, which causes problems if the editor shown on pageload is not a markdown editor.
   * Unsubscribe from the listener after content is set to each CodeMirror instance
   */
  initTextContentIfNgxMdeInView(): void {
    setTimeout(() => {
      const queryString = `ngx-markdown-editor-${this.tab.path}`
      const editor = document.getElementById(queryString)
      if (editor && this.ngxMde) {
        this.ngxMde.mde.setContent(this.tab.textContent)
        this.initialized$.next(true)
        this.initialized$.unsubscribe()
      }
    })
  }

  initSelectedTabListener(): void {
    this.state
      .getStatePart('selectedTab')
      .pipe(takeUntil(this.initialized$))
      .subscribe(() => this.initTextContentIfNgxMdeInView())
  }

  initAutoSave(): void {
    this.autoSave$
      .pipe(
        takeUntil(this.destroy$),
        skip(1), // Skip the initial update caused by the initialization of the editor
        debounceTime(1000),
        switchMap(() => this.state.getStatePart('tabs').pipe(take(1)))
      )
      .subscribe((tabs) => {
        this.updateContent(tabs, this.tab.path, this.textContent)
      })
  }

  initThemeListener(): void {
    this.state
      .getStatePart('editorTheme')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.isChecked = data === 'light'))
  }

  /**
   * The default NgxMarkdown preview renders checkboxes as disabled by default and overall is quite wonky
   */
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
  }

  updateContent(tabs: Tab[], path: string, content: string): void {
    const payload = { tabs, path, content }
    this.electronService.updateFileContent(payload)
  }

  onChangeTheme(): void {
    const theme = this.isChecked ? 'light' : 'dark'
    this.state.updateState$.next({ key: 'editorTheme', payload: theme })
  }
}
