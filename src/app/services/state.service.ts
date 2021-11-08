import { Injectable } from '@angular/core'
import { cloneDeep, merge } from 'lodash'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { distinctUntilKeyChanged, map, mergeMap, take, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../abstract/abstract-component'
import { Tab, TreeElement } from '../interfaces/Menu'

export interface State {
  baseDir: string
  menuLoading: boolean
  selectedTab: number
  tabs: Tab[]
  rootDirectory: TreeElement
}

/**
 * Used to infer correct payload value type given a generic keyof State, e.g 'menuItems' -> 'TreeNode[]'.
 * original: https://stackoverflow.com/questions/57691618/generic-interface-with-index-type-property-and-method
 */
export type StateUpdate<T> = {
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
    menuLoading: false,
    baseDir: '',
    selectedTab: 0,
    tabs: [],
    rootDirectory: {},
  }

  get value(): State {
    return this.state$.getValue()
  }

  public updateState$ = new Subject<StateUpdate<State>>()
  public updateMulti$ = new Subject<StateUpdate<State>[]>()
  public state$ = new BehaviorSubject<State>(this.initialState)

  constructor() {
    super()
    this.handleStateUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.state$.next(data)
      })

    this.handleStateUpdateMulti()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.state$.next(data)
      })
  }

  handleStateUpdate(): Observable<State> {
    return this.updateState$.pipe(mergeMap((value) => this.updateStatePart(value)))
  }

  handleStateUpdateMulti(): Observable<State> {
    return this.updateMulti$.pipe(mergeMap((value) => this.updateStateMulti(value)))
  }

  getStatePart<K extends keyof State>(key: K): Observable<State[K]> {
    return this.state$.asObservable().pipe(
      distinctUntilKeyChanged(key),
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
        const newState = cloneDeep({
          ...state,
          [key]: payload,
        })

        console.log({ oldState: state, newState })
        return newState
      })
    )
  }

  updateStateMulti(updateStateParts: StateUpdate<State>[]): Observable<State> {
    return this.state$.pipe(
      take(1),
      map((state) => {
        return updateStateParts.reduce((acc: State, curr: StateUpdate<State>) => {
          const { key, payload } = curr
          const newState = {
            ...acc,
            [key]: payload,
          }
          return newState
        }, state)
      })
    )
  }

  getStatePartValue<K extends keyof State>(key: K): State[K] {
    return this.state$.value[key]
  }

  getStateParts<K extends keyof State>(keys: K[]): Partial<State> {
    const getStateValue = (key: string) => this.state$.value[key]
    return keys.reduce((acc, curr) => {
      acc[curr] = getStateValue(curr)
      return acc
    }, <State>{})
  }
}
