import { OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'

export class AbstractComponent implements OnDestroy {
  public destroy$ = new Subject<boolean>()

  ngOnDestroy(): void {
    this.destroy$.next(true)
    this.destroy$.complete()
  }
}
