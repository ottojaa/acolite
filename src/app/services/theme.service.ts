import { HttpClient, HttpClientModule } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, combineLatest, forkJoin, merge, Observable, of } from 'rxjs'
import { filter, map, skipUntil, switchMap, tap } from 'rxjs/operators'
import { defaultThemes } from '../../../app/shared/constants'
import themes from '../../assets/themes/theme-options.json'
import { StateService } from './state.service'

export interface DefaultTheme {
  name: string
  displayName: string
}
interface Rule {
  token: string
  foreground?: string
  background?: string
  fontStyle?: string
}

interface Colors {
  [colorId: string]: string
}

export interface MonacoTheme {
  base: 'vs' | 'vs-dark' | 'hc-black'
  displayName: string
  name: string
  inherit: boolean
  rules: Rule[]
  colors: Colors
}

export type ThemeList = Array<DefaultTheme | MonacoTheme>
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  baseHref = 'assets/monaco-themes/'

  themeList$ = new BehaviorSubject<ThemeList>([])
  monacoReady$ = new BehaviorSubject<boolean>(false)
  themeListReady$ = new BehaviorSubject<boolean>(false)

  constructor(public http: HttpClient, public state: StateService) {}

  setTheme(theme: string): void {
    const selectedTheme = themes.find((option) => option.name === theme)
    if (selectedTheme) {
      const { styles } = selectedTheme
      Object.keys(styles).forEach((key) => {
        const propName = '--' + key
        document.documentElement.style.setProperty(propName, styles[key])
      })
    }
  }

  fetchThemeList(): Observable<ThemeList> {
    const defineAndGetThemeQueries = (theme: MonacoTheme) => {
      const queries = Object.entries(theme).map(([name, displayName]) =>
        this.http.get(`${this.baseHref}${displayName}.json`).pipe(
          map((themeData: Omit<MonacoTheme, 'themeName'>) => {
            monaco.editor.defineTheme(name, themeData)
            return { ...themeData, name, displayName }
          })
        )
      )
      return forkJoin(queries)
    }

    return this.isMonacoEditorReady().pipe(
      filter((isReady) => isReady),
      switchMap(() => {
        return this.http.get(`${this.baseHref}themelist.json`).pipe(switchMap(defineAndGetThemeQueries))
      }),
      map((themes) => [...defaultThemes, ...themes])
    )
  }

  fetchTheme(themeName: string): any {
    return this.http.get(`assets/monaco-themes/${themeName}.json`)
  }

  setMonacoTheme(theme: string): void {
    monaco.editor.setTheme(theme)
  }

  isMonacoEditorReady(): Observable<boolean> {
    return this.monacoReady$.asObservable().pipe(filter((isReady) => isReady))
  }

  isThemeListReady(): Observable<boolean> {
    return this.themeListReady$.asObservable().pipe(filter((isReady) => isReady))
  }

  isEditorViewReady(): Observable<boolean> {
    return combineLatest([
      this.isThemeListReady().pipe(tap(() => console.log('THEMELIST'))),
      this.isMonacoEditorReady().pipe(tap((data) => console.log('MONACO'))),
    ]).pipe(map((params) => params.every((param) => param)))
  }

  getThemeList(): Observable<ThemeList> {
    return this.themeList$.asObservable()
  }
}
