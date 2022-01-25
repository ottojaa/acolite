import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { filter, map, takeUntil, tap } from 'rxjs/operators'
import { TreeElement, ActiveIndent } from '../../../../app/shared/interfaces'
import { AbstractComponent } from '../../abstract/abstract-component'
import { ElectronService } from '../../core/services'
import { AppDialogService } from '../../services/dialog.service'
import { StateService } from '../../services/state.service'

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent extends AbstractComponent implements OnInit {
  menuLoading = true
  files: TreeElement[]
  workspaceName: string
  activeIndent$: Observable<ActiveIndent>
  files$: Observable<TreeElement[]>

  constructor(
    public electronService: ElectronService,
    public dialogService: AppDialogService,
    public state: StateService,
    public router: Router,
    public cdRef: ChangeDetectorRef,
    public zone: NgZone
  ) {
    super()
  }

  ngOnInit(): void {
    this.activeIndent$ = this.state.getStatePart('selectedTab').pipe(map((tab) => tab.activeIndent))
    this.files$ = this.state.getStatePart('rootDirectory').pipe(
      takeUntil(this.destroy$),
      filter((dir) => !!dir),
      tap((rootDir) => {
        if (rootDir && rootDir.data) {
          this.workspaceName = window.path.getBaseName(rootDir.data.filePath)
        }
      }),
      map((rootDir) => rootDir.children),
      tap(() => {
        this.menuLoading = false
        this.cdRef.detectChanges()
      })
    )
  }
}
