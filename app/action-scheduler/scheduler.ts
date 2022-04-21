import { combineLatest, Observable, ReplaySubject, Subject } from 'rxjs'
import { distinctUntilChanged, map, mergeMap, startWith, tap } from 'rxjs/operators'

/**
 * Queues promises and resolves them one by one in order. IsScheduling determines whether the queue is active
 */
export class Scheduler {
  queue$ = new Subject()
  results$: Observable<void>
  isScheduling$ = new ReplaySubject<boolean>(1)

  constructor() {
    this.results$ = this.queue$.pipe(mergeMap((action: Promise<void>) => action, 10))
    this.isScheduling().subscribe((scheduling) => this.isScheduling$.next(scheduling))
  }

  addToQueue(action: Promise<void>): void {
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
