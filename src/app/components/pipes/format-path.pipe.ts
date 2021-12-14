import { Pipe, PipeTransform } from '@angular/core'
import { getDirName } from '../../../../app/electron-utils/file-utils'

@Pipe({ name: 'formatPath' })
export class FormatPathPipe implements PipeTransform {
  transform(value: string, basePath: string): string {
    return value.replace(getDirName(basePath), '')
  }
}
