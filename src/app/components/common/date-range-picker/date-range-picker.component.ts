import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../../../abstract/abstract-component'

interface DateRange {
  start?: Date
  end?: Date
}

interface ISODateRange {
  start?: string
  end?: string
}

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss'],
})
export class DateRangePickerComponent extends AbstractComponent implements OnInit {
  @Input() dateRange: { start: Date; end: Date }
  @Output() dateRangeChange = new EventEmitter()
  maxDate = new Date()

  range: FormGroup

  constructor() {
    super()
  }

  ngOnInit(): void {
    this.initForm()
    this.range.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((data: DateRange) => {
      this.dateRangeChange.emit(data)
    })
  }

  initForm(): any {
    const { start, end } = this.dateRange

    if (start || end) {
      this.range = new FormGroup({
        start: new FormControl(start),
        end: new FormControl(end),
      })
    } else {
      this.range = new FormGroup({
        start: new FormControl(),
        end: new FormControl(),
      })
    }
  }
}
