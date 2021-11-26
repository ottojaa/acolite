import { NativeDateAdapter } from '@angular/material/core'

/**
 * Datepicker by default does not support locales for manually written values, which are always in US format (MM.DD.YYYY))
 */
export class CustomDateAdapter extends NativeDateAdapter {
  parse(value: any): Date | null {
    const currentDate = new Date()
    let year: number = currentDate.getFullYear()
    let month: number = currentDate.getMonth()
    let day: number = currentDate.getDate()

    if (typeof value === 'string' && (value.indexOf('/') > -1 || value.indexOf('.') > -1 || value.indexOf('-') > -1)) {
      const str = value.split(/[\./-]/)

      day = !!str[0] ? +str[0] : day
      month = !!str[1] ? +str[1] - 1 : month
      year = !!str[2]
        ? // If year is less than 3 digit long, we add 2000.
          +str[2].length <= 3
          ? +str[2] + 2000
          : +str[2]
        : year

      return new Date(year, month, day)
    }
  }
}
