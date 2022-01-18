import { combineLatest, Observable, Subject } from 'rxjs'
import { concatMap, debounceTime, distinctUntilChanged, map, startWith, tap } from 'rxjs/operators'

/**
 * Queues promises and resolves them one by one in order. IsScheduling determines whether the queue is active
 */
export class Scheduler {
  queue$ = new Subject()
  results$: Observable<any>

  constructor() {
    this.results$ = this.queue$.pipe(concatMap((action: Promise<any>) => action))
  }

  addToQueue(action: Promise<any>): void {
    this.queue$.next(action)
  }

  isScheduling(): Observable<boolean> {
    return combineLatest([
      this.queue$.pipe(
        map((_, index) => index),
        startWith(-1)
      ),
      this.results$.pipe(
        map((_, index) => index),
        startWith(-1)
      ),
    ]).pipe(
      map(([changeIndex, queueIndex]) => changeIndex !== queueIndex),
      distinctUntilChanged()
    )
  }
}
