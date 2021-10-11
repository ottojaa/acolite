import { Injectable } from '@angular/core'
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs'
import { map, mergeMap, take, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../abstract/abstract-component'

type StateKeys = 'baseDir'
type State = Record<StateKeys, any>

@Injectable({
  providedIn: 'root',
})
export class StateService extends AbstractComponent {
  initialState: State = {
    baseDir: '',
  }

  public updateState$ = new Subject<{ key: keyof State; payload: any }>()
  public state$ = new BehaviorSubject<State>(this.initialState)

  constructor() {
    super()
    this.handleStateUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.state$.next(data)
        console.log('State updated: ', data)
      })
  }

  handleStateUpdate(): Observable<State> {
    const observables = [this.updateState$]
    return merge(...observables).pipe(mergeMap(this.updateStatePart()))
  }

  getStatePart<K extends keyof State>(key: K): Observable<State[K]> {
    console.log(this.getState())
    return this.state$.asObservable().pipe(
      map((state) => {
        console.log(state)
        return state[key]
      })
    )
  }

  updateStatePart<T, K extends keyof State>(): (obj: { key: K; payload: T }) => Observable<State> {
    return (obj) =>
      this.state$.pipe(
        take(1),
        map((state) => {
          const { key, payload } = obj
          const newState = {
            ...state,
            [key]: payload,
          }

          console.log({ oldState: state, newState })
          return newState
        })
      )
  }

  getState(): State {
    return this.state$.value
  }

  getStatePartValue(key: keyof State) {
    return this.state$.value[key]
  }
}
