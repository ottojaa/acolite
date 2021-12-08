import { trigger, style, transition, animate } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { omit } from 'lodash'
import { Subject } from 'rxjs'
import { debounceTime, takeUntil, tap } from 'rxjs/operators'
import { SearchPreference } from '../../../../../app/shared/interfaces'
import { AbstractComponent } from '../../../abstract/abstract-component'
import { StateService } from '../../../services/state.service'

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
    start?: Date
    end?: Date
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
export class SearchBuilderDialogComponent extends AbstractComponent implements OnInit {
  listItems: ListItem[]
  debouncedSave$ = new Subject()

  get atLeastOneSearchOptionSelected(): boolean {
    const searchOptions = ['filePath', 'fileName', 'content']

    return this.listItems
      .filter(this.isOptionItem)
      .filter((item) => searchOptions.includes(item.value))
      .some((item) => item.selected)
  }

  constructor(public state: StateService) {
    super()
  }

  ngOnInit(): void {
    this.listItems = this.getListItems()
    this.debouncedSave$.pipe(takeUntil(this.destroy$), debounceTime(100)).subscribe(() => {
      this.onSave()
    })
  }

  isOptionItem(item: ListItem): item is OptionItem {
    return item.type === 'item'
  }

  getSearchPreferencesFromListItems(): SearchPreference[] {
    return this.listItems.filter(this.isOptionItem).map((el) => omit(el, ['text', 'type']))
  }

  onDateRangeChange(event: { start: Date; end: Date }, value: string): void {
    const optionItems = this.listItems.filter(this.isOptionItem)
    const itemIdx = optionItems.findIndex((item) => item.value === value)
    if (itemIdx > -1) {
      if (event.start) {
        optionItems[itemIdx].range = event
      }
      this.debouncedSave$.next()
    }
  }

  onSave(): void {
    const preferences = this.getSearchPreferencesFromListItems()
    this.state.updateState$.next([{ key: 'searchPreferences', payload: preferences }])
  }

  getListItems(): ListItem[] {
    const currentPreferences = this.state.getStatePartValue('searchPreferences')
    const items: ListItem[] = [
      {
        type: 'label',
        label: 'Search',
      },
      {
        type: 'item',
        value: 'fileName',
        text: 'Name',
        selected: true,
      },
      {
        type: 'item',
        value: 'content',
        text: 'Content',
        selected: true,
      },
      {
        type: 'item',
        value: 'filePath',
        text: 'Path',
        selected: true,
      },
      {
        type: 'separator',
      },
      {
        type: 'label',
        label: 'Filter',
      },
      {
        type: 'item',
        value: 'modifiedAt',
        text: 'Last modified date',
        selected: false,
        range: {
          start: undefined,
          end: undefined,
        },
      },
      {
        value: 'createdAt',
        text: 'Created date',
        type: 'item',
        selected: false,
        range: {
          start: undefined,
          end: undefined,
        },
      },
    ]

    if (currentPreferences?.length) {
      const isOptionItem = (item: ListItem): item is OptionItem => item.type === 'item'
      currentPreferences.forEach((preference) => {
        const preferenceIdx = items.findIndex((el) => {
          if (isOptionItem(el)) {
            return el.value === preference.value
          }
          return false
        })

        if (preferenceIdx > -1) {
          items[preferenceIdx] = { ...items[preferenceIdx], ...preference }
        }
      })
    }

    return items
  }
}
