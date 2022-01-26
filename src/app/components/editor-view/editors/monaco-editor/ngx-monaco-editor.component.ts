import { trigger, transition, style, animate } from '@angular/animations'
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import {
  MonacoEditorConstructionOptions,
  MonacoEditorLoaderService,
  MonacoStandaloneCodeEditor,
} from '@materia-ui/ngx-monaco-editor'
import { AbstractEditor } from 'app/abstract/abstract-editor'
import { ThemeService } from 'app/services/theme.service'
import { BehaviorSubject, Observable } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { Doc } from '../../../../../../app/shared/interfaces'
import { ElectronService } from '../../../../core/services'
import { StateService } from '../../../../services/state.service'

@Component({
  selector: 'app-monaco-editor',
  templateUrl: './ngx-monaco-editor.component.html',
  styleUrls: ['./ngx-monaco-editor.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [style({ opacity: 0 }), animate(300, style({ opacity: 1 }))]),
      transition(':leave', [animate(300, style({ opacity: 0 }))]),
    ]),
  ],
})
export class NgxMonacoEditorComponent extends AbstractEditor implements OnInit {
  @Input() tab: Doc

  fileContent: string
  monacoReady$: Observable<boolean>
  themeListReady$: Observable<boolean>
  editor: MonacoStandaloneCodeEditor

  editorOptions: MonacoEditorConstructionOptions = { autoDetectHighContrast: false, fixedOverflowWidgets: true }
  editorInstance$ = new BehaviorSubject<MonacoStandaloneCodeEditor>(null)

  editorInit = false

  get filePath(): string {
    return this.tab.filePath
  }

  constructor(
    public electronService: ElectronService,
    public state: StateService,
    public themeService: ThemeService,
    public monacoLoaderService: MonacoEditorLoaderService,
    public cdRef: ChangeDetectorRef
  ) {
    super(electronService, state)
  }

  ngOnInit(): void {
    this.fileContent = this.tab.fileContent
    this.monacoReady$ = this.state.getStatePart('monacoReady')
    this.themeListReady$ = this.themeService.isThemeListReady()
    this.initEditorListener()
  }

  onEditorInit(editorInstance: MonacoStandaloneCodeEditor): void {
    this.editorInstance$.next(editorInstance)
  }

  onInputChange(): void {
    if (!this.editorInit) {
      return
    }
    this.autoSave$.next({ filePath: this.filePath, content: this.fileContent })
  }

  initEditorListener(): void {
    this.editorInstance$
      .pipe(
        filter((editor) => !!editor),
        take(1)
      )
      .subscribe((editorInstace) => {
        this.initEditor(editorInstace)
        monaco.editor.setTheme(this.state.getStatePartValue('monacoEditorTheme'))
      })
  }

  initEditor(editorInstance: MonacoStandaloneCodeEditor): void {
    this.editor = editorInstance

    const createModel = () => {
      return monaco.editor.createModel(this.tab.fileContent, undefined, monaco.Uri.file(this.filePath))
    }

    const model = createModel()
    this.editor.setModel(model)

    this.editorInit = true
  }

  updateEditorOptions(payload: MonacoEditorConstructionOptions): void {
    this.editorOptions = { ...this.editorOptions, ...payload }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy()
    monaco.editor
      .getModels()
      .find((model) => model.uri.path === this.filePath)
      .dispose()
  }
}
