import { Component, OnDestroy } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { StateService } from 'app/services/state.service'
import { Observable, Subject } from 'rxjs'
import { takeUntil, skip, debounceTime } from 'rxjs/operators'
import { SelectedTab, State } from '../../../app/shared/interfaces'
import { AbstractComponent } from './abstract-component'

@Component({
  template: '',
})
export class AbstractEditor extends AbstractComponent {
  public destroy$ = new Subject<boolean>()
  public autoSave$ = new Subject<{ filePath: string; content: string }>()
  public initialized$ = new Subject<boolean>()

  constructor(public electronService: ElectronService, public state: StateService) {
    super()
    this.initAutoSave()
  }

  initAutoSave(): void {
    this.autoSave$.pipe(takeUntil(this.destroy$), debounceTime(1000)).subscribe((payload) => {
      this.electronService.updateFileContent({ ...payload, state: this.state.value })
    })
  }

  selectedTabListener(): Observable<SelectedTab> {
    return this.state.getStatePart('selectedTab').pipe(takeUntil(this.initialized$))
  }

  themeListener(): Observable<string> {
    return this.state.getStatePart('editorTheme').pipe(takeUntil(this.destroy$))
  }
}
