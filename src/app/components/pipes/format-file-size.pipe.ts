import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'formatSize' })
export class FormatFileSizePipe implements PipeTransform {
  transform(size: number, decimals: number = 2): string {
    if (size === 0) {
      return '-'
    }

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(size) / Math.log(k))

    return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
}
