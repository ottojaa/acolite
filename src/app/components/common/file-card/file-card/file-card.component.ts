import { trigger, transition, style, animate, keyframes } from '@angular/animations'
import { ChangeDetectionStrategy, Component, Input, NgZone, OnInit } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { AppDialogService } from 'app/services/dialog.service'
import { StateService } from 'app/services/state.service'
import { TabService } from 'app/services/tab.service'
import { from, Observable, Subject } from 'rxjs'
import { delay, tap } from 'rxjs/operators'
import { imageTypes } from '../../../../../../app/shared/constants'
import { Doc } from '../../../../../../app/shared/interfaces'

@Component({
  selector: 'app-file-card',
  templateUrl: './file-card.component.html',
  styleUrls: ['./file-card.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [style({ opacity: 0 }), animate(300, style({ opacity: 1 }))]),
      transition(':leave', [animate(300, style({ opacity: 0 }))]),
    ]),
  ],
})
export class FileCardComponent implements OnInit {
  @Input() file: Doc
  @Input() showBookmark: boolean

  imageTypesArr = imageTypes
  thumbnail$: Observable<string>

  constructor(
    private tabService: TabService,
    private state: StateService,
    private dialogService: AppDialogService,
    private zone: NgZone,
    private electronService: ElectronService
  ) {}

  ngOnInit(): void {
    this.thumbnail$ = this.getThumbnail(this.file.filePath)
  }

  openInNewTab(file: Doc): void {
    const { filePath } = file
    this.tabService.openNewTab(filePath)
  }

  confirmRemoveBookmark(path: string): void {
    this.zone.run(() => {
      this.dialogService.openConfirmDialog({ title: 'Remove bookmark?' }).subscribe((data) => {
        if (data) {
          this.tabService.removeBookmark(path)
        }
      })
    })
  }

  getThumbnail(filePath: string): Observable<string> {
    const baseDir = this.state.getStatePartValue('baseDir')

    return from(this.electronService.getThumbnail({ filePath, baseDir }))
  }
}
