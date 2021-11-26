import { Component, OnInit, ViewChild } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../../../abstract/abstract-component'

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss'],
})
export class DateRangePickerComponent extends AbstractComponent implements OnInit {
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  })

  constructor() {
    super()
  }

  ngOnInit(): void {
    this.range.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      console.log(data)
    })
  }
}
