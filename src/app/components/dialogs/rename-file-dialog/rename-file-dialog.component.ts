import { Component, Inject, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
  selector: 'app-rename-file-dialog',
  templateUrl: './rename-file-dialog.component.html',
  styleUrls: ['./rename-file-dialog.component.scss'],
})
export class RenameFileDialogComponent {
  extension: string
  fileName = new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚäöüÄÖÜß ]+$')])

  constructor(public dialogRef: MatDialogRef<RenameFileDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: string) {
    this.initFileNameAndExtension(data)
  }

  onNoClick(): void {
    this.dialogRef.close()
  }

  getErrorMessage(): string | undefined {
    if (this.fileName.hasError('required')) {
      return 'You must enter a file name'
    }
    if (this.fileName.hasError('pattern')) {
      return 'Name can only contain letters and numbers'
    }
  }

  initFileNameAndExtension(filePath: string): void {
    const [fileName, extension] = filePath.split('/').pop().split('.')
    this.fileName.setValue(fileName)
    this.extension = extension
  }
}
