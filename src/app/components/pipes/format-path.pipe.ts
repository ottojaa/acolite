import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'formatPath' })
export class FormatPathPipe implements PipeTransform {
  transform(value: string, basePath: string): string {
    const dirName = window.path.getDirName(basePath)
    return value.replace(dirName, '')
  }
}
