import { Component, NgZone, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { FolderActionResponses } from '../../../../../app/shared/actions'
import { ElectronService } from '../../../core/services'
import { StateService } from '../../../services/state.service'

@Component({
  selector: 'app-change-directory-dialog',
  templateUrl: './change-directory-dialog.component.html',
  styleUrls: ['./change-directory-dialog.component.scss'],
})
export class ChangeDirectoryDialogComponent implements OnInit {
  rootDir: string
  constructor(
    private state: StateService,
    private electronService: ElectronService,
    private dialogRef: MatDialogRef<ChangeDirectoryDialogComponent>,
    private zone: NgZone
  ) {
    this.zone.run(() => {
      const callBack = () => this.dialogRef.close()
      this.electronService.on(FolderActionResponses.ChooseDirectorySuccess, () => callBack())
    })
  }

  ngOnInit(): void {
    this.rootDir = this.state.getStatePartValue('baseDir')
  }

  onChooseDirectory(): void {
    this.electronService.chooseDirectory()
  }

  onCancel(): void {
    this.dialogRef.close()
  }
}
