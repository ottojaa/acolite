import { Injectable } from '@angular/core'
import { cloneDeep } from 'lodash'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { distinctUntilKeyChanged, map, mergeMap, take, takeUntil, tap } from 'rxjs/operators'
import { allowedConfigKeys } from '../../../app/shared/constants'
import { State } from '../../../app/shared/interfaces'
import { AbstractComponent } from '../abstract/abstract-component'
import { ElectronService } from '../core/services'
import { SettingsService } from './settings.service'

interface UpdatePayload {
  state: State
  updateStore: boolean
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
    initialized: false,
    baseDir: '',
    selectedTab: {
      path: '',
      index: 0,
    },
    editorTheme: 'dark',
    sideMenuWidth: 20,
    searchResults: [],
    tabs: [],
    rootDirectory: {},
    searchPreferences: [],
    bookmarks: [],
    bookmarkedFiles: [],
    recentlyModified: [],
  }

  get value(): State {
    return this.state$.getValue()
  }

  public updateState$ = new Subject<StateUpdate<State>[]>()
  public updateStateDeep$ = new Subject<StateUpdate<unknown>>()
  public state$ = new BehaviorSubject<State>(this.initialState)

  constructor(public settings: SettingsService, public electronService: ElectronService) {
    super()
    this.handleStateUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.updateStateAndStore(data)
      })
  }

  updateStateAndStore(payload: UpdatePayload): void {
    const { state, updateStore } = payload
    this.state$.next(state)

    if (updateStore) {
      console.log('Triggered store update')
      this.electronService.updateStore({ state })
    }
  }

  handleStateUpdate(): Observable<UpdatePayload> {
    return this.updateState$.pipe(
      tap((update) => console.log('Triggered update:', update)),
      mergeMap((value) => this.updateState(value))
    )
  }

  getStatePart<K extends keyof State>(key: K): Observable<State[K]> {
    return this.state$.asObservable().pipe(
      distinctUntilKeyChanged(key),
      map((state) => state[key])
    )
  }

  /**
   *
   * @param prop1 first level property of State
   * @param prop2 second level property of State[prop1]
   */
  getStatePartDeep<P1 extends keyof State, P2 extends keyof State[P1]>(
    prop1: P1,
    prop2: P2
  ): Observable<State[P1][P2]> {
    return this.state$.asObservable().pipe(
      map((state) => state[prop1]),
      distinctUntilKeyChanged(prop2),
      map((nestedState) => nestedState[prop2])
    )
  }

  getStatePartValueDeep<P1 extends keyof State, P2 extends keyof State[P1]>(prop1: P1, prop2: P2): State[P1][P2] {
    return this.value[prop1][prop2]
  }

  /**
   * Updates nested properties without mutating the state object
   */
  updateStatePartDeep<P1 extends keyof State>(prop1: P1, update: StateUpdate<State[P1]>): Observable<UpdatePayload> {
    return this.state$.pipe(
      take(1),
      map((state) => {
        const newState = cloneDeep(state)
        const { key, payload } = update

        newState[prop1][key] = payload

        console.log({ oldState: state, newState })
        return { state: newState, updateStore: this.shouldTriggerStoreUpdate([key as string]) }
      })
    )
  }

  updateState(updateStateParts: StateUpdate<State>[]): Observable<UpdatePayload> {
    return this.state$.pipe(
      take(1),
      map((state) => {
        const allKeys = updateStateParts.map((el) => el.key)
        const newState = updateStateParts.reduce((acc: State, curr: StateUpdate<State>) => {
          const { key, payload } = curr
          const newState = {
            ...acc,
            [key]: payload,
          }
          return newState
        }, state)

        console.log({ oldState: state, newState })
        return { state: newState, updateStore: this.shouldTriggerStoreUpdate(allKeys) }
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

  // If state property key is included in allowedConfigKeys, update the persistent config file
  shouldTriggerStoreUpdate(keys: string[]): boolean {
    const triggers = allowedConfigKeys
    return keys.some((key) => triggers.includes(key))
  }
}
