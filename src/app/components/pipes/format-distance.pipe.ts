import { Pipe, PipeTransform } from '@angular/core'
import { formatDistanceToNowStrict } from 'date-fns'

@Pipe({ name: 'formatDistance' })
export class FormatDistancePipe implements PipeTransform {
  transform(date: Date | string): string {
    date = new Date(date)
    return formatDistanceToNowStrict(date)
  }
}
