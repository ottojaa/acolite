import { trigger, state, style, transition, animate } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { MatDialogRef } from '@angular/material/dialog'

type ListItemType = 'item' | 'separator' | 'label'

interface SeparatorItem {
  type: 'separator'
}

interface LabelItem {
  type: 'label'
  label: string
}

interface OptionItem {
  type: 'item'
  value: string
  text: string
  selected: boolean
  range?: {
    from: string
    to: string
  }
}

type ListItem = SeparatorItem | LabelItem | OptionItem

@Component({
  selector: 'app-search-builder-dialog',
  templateUrl: './search-builder-dialog.component.html',
  styleUrls: ['./search-builder-dialog.component.scss'],
  animations: [
    trigger('grow', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('100ms ease-in-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [animate('100ms ease-in-out', style({ height: 0, opacity: 0 }))]),
    ]),
  ],
})
export class SearchBuilderDialogComponent implements OnInit {
  updatedDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  })

  createdDateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  })

  listItems: ListItem[]

  constructor(public dialogRef: MatDialogRef<SearchBuilderDialogComponent>) {}

  ngOnInit(): void {
    this.listItems = this.getListItems()
  }

  onCancelClick(): void {
    this.dialogRef.close()
  }

  onChange(): void {
    console.log(this.listItems)
  }

  getListItems(): ListItem[] {
    return [
      {
        type: 'label',
        label: 'Search by',
      },
      {
        type: 'item',
        value: 'fileName',
        text: 'File name',
        selected: true,
      },
      {
        type: 'item',
        value: 'content',
        text: 'File content',
        selected: true,
      },
      {
        type: 'item',
        value: 'filePath',
        text: 'File path',
        selected: true,
      },
      {
        type: 'separator',
      },
      {
        type: 'label',
        label: 'Filter results',
      },
      {
        type: 'item',
        value: 'lastUpdated',
        text: 'Last modified date',
        selected: false,
        range: {
          from: '',
          to: '',
        },
      },
      {
        value: 'createdAt',
        text: 'Created date',
        type: 'item',
        selected: false,
        range: {
          from: '',
          to: '',
        },
      },
    ]
  }
}
