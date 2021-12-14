import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'formatName' })
export class FormatFileNamePipe implements PipeTransform {
  transform(value: string): string {
    const stringArr = value.split('.')
    stringArr.pop()
    return stringArr.join('')
  }
}
