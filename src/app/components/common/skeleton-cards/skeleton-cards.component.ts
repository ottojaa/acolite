import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'app-skeleton-cards',
  templateUrl: './skeleton-cards.component.html',
  styleUrls: ['./skeleton-cards.component.scss'],
})
export class SkeletonCardsComponent implements OnInit {
  @Input() amount: number
  cardArr: number[]

  constructor() {}

  ngOnInit(): void {
    this.cardArr = Array.from(Array(this.amount))
  }
}
