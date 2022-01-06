import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { distinctUntilKeyChanged, map, mergeMap, take, takeUntil, tap } from 'rxjs/operators'
import { expandNodeRecursive } from '../../../app/electron-utils/utils'
import { allowedConfigKeys } from '../../../app/shared/constants'
import { State } from '../../../app/shared/interfaces'
import { AbstractComponent } from '../abstract/abstract-component'
import { ElectronService } from '../core/services'
import { SettingsService } from './settings.service'

interface UpdatePayload {
  state: State
  triggerKeys: (keyof State)[]
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

interface TriggerMap {
  expandNodeParents: string[]
  updateStore: string[]
  bookmarks: string[]
  recentlyModified: string[]
}

@Injectable({
  providedIn: 'root',
})
export class StateService extends AbstractComponent {
  initialState: State = {
    initialized: false,
    baseDir: '',
    selectedTab: {
      filePath: '',
      index: 0,
      forceDashboard: false,
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
    const { state, triggerKeys } = payload
    this.state$.next(state)
    this.handleCallbacks(state, triggerKeys)
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
   * Updates nested properties without mutating the state object (unused for the time being + should probably reimplement without typecast)
   */
  /* updateStatePartDeep<P1 extends keyof State>(prop1: P1, update: StateUpdate<State[P1]>): Observable<UpdatePayload> {
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
  } */

  updateState(updateStateParts: StateUpdate<State>[]): Observable<UpdatePayload> {
    return this.state$.pipe(
      take(1),
      map((state) => {
        const allKeys = updateStateParts.map((el) => el.key)
        const newState = updateStateParts.reduce((acc: State, curr: StateUpdate<State>) => {
          const { key, payload } = curr
          return {
            ...acc,
            [key]: payload,
          }
        }, state)

        console.log({ oldState: state, newState })
        return { state: newState, triggerKeys: allKeys }
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
    }, {} as State)
  }

  /**
   * In case certain keys in the state were updated, we may want to do certain side effects after the state is updated instead of before,
   * in case the callback takes time that is clearly visible on the UI (e.g 100ms+).
   * @param triggerKeys they keys that triggered the state update
   *
   */
  handleCallbacks(state: State, triggerKeys: (keyof State)[]): void {
    const { selectedTab, rootDirectory, bookmarks } = state

    const triggerMap: TriggerMap = {
      expandNodeParents: ['selectedTab'],
      bookmarks: ['bookmarks'],
      recentlyModified: ['rootDirectory'],
      updateStore: allowedConfigKeys,
    }

    const shouldTrigger = (action: keyof TriggerMap) => triggerKeys.some((key) => triggerMap[action].includes(key))

    if (shouldTrigger('expandNodeParents')) {
      expandNodeRecursive(rootDirectory, selectedTab.filePath)
    }
    if (shouldTrigger('updateStore')) {
      this.electronService.updateStore({ state })
    }
    if (shouldTrigger('recentlyModified')) {
      this.electronService.getRecentlyModified()
    }
    if (shouldTrigger('bookmarks')) {
      this.electronService.getBookmarkedFiles({ bookmarks })
    }
  }
}
