import { trigger, transition, style, animate, keyframes } from '@angular/animations'
import { ChangeDetectorRef, Component, Input, NgZone, OnInit } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Doc } from '../../../../../../app/shared/interfaces'

@Component({
  selector: 'app-editor-content-loader',
  templateUrl: './editor-content-loader.component.html',
  styleUrls: ['./editor-content-loader.component.scss'],
  animations: [
    trigger('componentLoaded', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('.3s ease-in', keyframes([style({ opacity: 0 }), style({ opacity: 1 })])),
      ]),
    ]),
  ],
})
export class EditorContentLoaderComponent implements OnInit {
  @Input() tab: Doc

  tabData$: Observable<Doc>

  constructor(public electronService: ElectronService, public zone: NgZone, public cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.tabData$ = this.getTabData(this.tab)
  }

  getTabData(tab: Doc): Observable<Doc> {
    return from(
      this.electronService.getFileData({
        filePath: tab.filePath,
        encoding: tab.editorConfig.encoding,
      })
    ).pipe(map((fileContent) => ({ ...tab, fileContent: fileContent })))
  }
}
