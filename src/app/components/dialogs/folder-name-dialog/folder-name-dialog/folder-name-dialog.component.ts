import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

interface DialogData {
  name: string
}

@Component({
  selector: 'app-folder-name-dialog',
  templateUrl: './folder-name-dialog.component.html',
  styleUrls: ['./folder-name-dialog.component.scss'],
})
export class FolderNameDialogComponent {
  name: string

  constructor(
    public dialogRef: MatDialogRef<FolderNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close()
  }
}
