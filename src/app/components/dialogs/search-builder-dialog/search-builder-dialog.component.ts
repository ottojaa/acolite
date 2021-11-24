import { Component, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'app-search-builder-dialog',
  templateUrl: './search-builder-dialog.component.html',
  styleUrls: ['./search-builder-dialog.component.scss'],
})
export class SearchBuilderDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<SearchBuilderDialogComponent>) {}

  ngOnInit(): void {}
}
