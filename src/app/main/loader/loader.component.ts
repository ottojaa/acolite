import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { takeUntil } from 'rxjs/operators'
import { AbstractComponent } from '../../abstract/abstract-component'
import { StateService } from '../../services/state.service'

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent extends AbstractComponent implements OnInit {
  constructor(public state: StateService, public router: Router) {
    super()
    this.state
      .getStatePart('initialized')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.router.navigate(['main'])
        }
      })
  }

  ngOnInit(): void {}
}
