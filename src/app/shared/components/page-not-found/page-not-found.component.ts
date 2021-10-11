import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
})
export class PageNotFoundComponent implements OnInit {
  constructor(public route: ActivatedRoute) {
    console.log(this.route.snapshot.url)
  }

  ngOnInit(): void {
    console.log('PageNotFoundComponent INIT')
  }
}
