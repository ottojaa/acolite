import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { distinctUntilKeyChanged, map, mergeMap, take, takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../abstract/abstract-component'
import { ElectronService } from '../core/services'
import { allowedConfigKeys } from '../entities/file/constants'
import { SearchResult, Tab, TreeElement } from '../interfaces/Menu'
import { SettingsService } from './settings.service'

interface UpdatePayload {
  state: State
  updateStore: boolean
}
export interface State {
  baseDir: string
  initialized: boolean
  selectedTab: number
  editorTheme: 'dark' | 'light'
  sideMenuWidth: number
  searchResults: SearchResult[]
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
    initialized: false,
    baseDir: '',
    selectedTab: 0,
    editorTheme: 'dark',
    sideMenuWidth: 20,
    searchResults: [],
    tabs: [],
    rootDirectory: {},
  }

  get value(): State {
    return this.state$.getValue()
  }

  public updateState$ = new Subject<StateUpdate<State>>()
  public updateMulti$ = new Subject<StateUpdate<State>[]>()
  public state$ = new BehaviorSubject<State>(this.initialState)

  constructor(public settings: SettingsService, public electronService: ElectronService) {
    super()
    this.handleStateUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.updateStateAndStore(data)
      })

    this.handleStateUpdateMulti()
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
      this.electronService.updateStore(state)
    }
  }

  handleStateUpdate(): Observable<UpdatePayload> {
    return this.updateState$.pipe(mergeMap((value) => this.updateStatePart(value)))
  }

  handleStateUpdateMulti(): Observable<UpdatePayload> {
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

  updateStatePart(update: StateUpdate<State>): Observable<UpdatePayload> {
    return this.state$.pipe(
      take(1),
      map((state) => {
        const { key, payload } = update

        const newState = {
          ...state,
          [key]: payload,
        }

        console.log({ oldState: state, newState })
        return { state: newState, updateStore: this.shouldTriggerStoreUpdate([key]) }
      })
    )
  }

  updateStateMulti(updateStateParts: StateUpdate<State>[]): Observable<UpdatePayload> {
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
  shouldTriggerStoreUpdate(keys: (keyof State)[]): boolean {
    const triggers = allowedConfigKeys
    return keys.some((key) => triggers.includes(key))
  }
}
