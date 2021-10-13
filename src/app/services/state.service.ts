import { Injectable } from '@angular/core'
import { TreeNode } from 'primeng/api'
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs'
import { map, mergeMap, take, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../abstract/abstract-component'
interface State {
  baseDir: string
  menuItems: TreeNode[]
}

/**
 * Used to infer correct payload value type given a generic keyof State, e.g 'menuItems' -> 'TreeNode[]'.
 * original: https://stackoverflow.com/questions/57691618/generic-interface-with-index-type-property-and-method
 */
type StateUpdate<T> = {
  [P in keyof T]: {
    key: P
    payload: T[P]
  }
}[keyof T]

@Injectable({
  providedIn: 'root',
})
export class StateService extends AbstractComponent {
  initialState: State = {
    baseDir: '',
    menuItems: [],
  }

  get value(): State {
    return this.state$.getValue()
  }

  public updateState$ = new Subject<StateUpdate<State>>()
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
    return merge(...observables).pipe(mergeMap((value) => this.updateStatePart(value)))
  }

  getStatePart<K extends keyof State>(key: K): Observable<State[K]> {
    return this.state$.asObservable().pipe(
      map((state) => {
        return state[key]
      })
    )
  }

  updateStatePart(update: StateUpdate<State>): Observable<State> {
    return this.state$.pipe(
      take(1),
      map((state) => {
        const { key, payload } = update
        const newState = {
          ...state,
          [key]: payload,
        }

        console.log({ oldState: state, newState })
        return newState
      })
    )
  }

  getStatePartValue<K extends keyof State>(key: K): State[K] {
    return this.state$.value[key]
  }
}
