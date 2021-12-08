import { Component, Inject } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { nameValidationPattern } from '../../../../../../app/shared/constants'

@Component({
  selector: 'app-folder-creation-dialog',
  templateUrl: './folder-creation-dialog.component.html',
  styleUrls: ['./folder-creation-dialog.component.scss'],
})
export class FolderCreationDialogComponent {
  folderName = new FormControl('', [Validators.required, Validators.pattern(nameValidationPattern)])

  constructor(
    public dialogRef: MatDialogRef<FolderCreationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { filePath: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close()
  }

  getErrorMessage(): string | undefined {
    if (this.folderName.hasError('required')) {
      return 'You must enter a file name'
    }
    if (this.folderName.hasError('pattern')) {
      return 'Name can only contain letters and numbers'
    }
  }
}
