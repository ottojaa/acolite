import { Component, NgZone, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { FolderActionResponses } from '../../../../../app/shared/actions'
import { ElectronService } from '../../../core/services'
import { StateService } from '../../../services/state.service'

@Component({
  selector: 'app-base-directory-dialog',
  templateUrl: './base-directory-dialog.component.html',
  styleUrls: ['./base-directory-dialog.component.scss'],
})
export class BaseDirectoryDialogComponent implements OnInit {
  rootDir: string

  constructor(
    public dialogRef: MatDialogRef<BaseDirectoryDialogComponent>,
    private electronService: ElectronService,
    private state: StateService,
    private zone: NgZone
  ) {
    this.zone.run(() => {
      const callBack = () => this.dialogRef.close()
      this.electronService.on(FolderActionResponses.ChooseDirectorySuccess, () => callBack())
      this.electronService.on(FolderActionResponses.SetDefaultDirSuccess, () => callBack())
    })
  }

  ngOnInit(): void {
    this.rootDir = this.state.getStatePartValue('baseDir')
  }

  onChooseDirectory(): void {
    this.electronService.chooseDirectory()
  }

  onSetDefaultDirectory(): void {
    this.electronService.setDefaultDir()
  }
}
