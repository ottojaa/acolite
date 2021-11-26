import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DateRangePickerComponent } from './date-range-picker.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { DateAdapter, MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core'
import { Platform } from '@angular/cdk/platform'
import { CustomDateAdapter } from './date-adapter'

@NgModule({
  declarations: [DateRangePickerComponent],
  exports: [DateRangePickerComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [{ provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }],
})
export class DateRangePickerModule {}
