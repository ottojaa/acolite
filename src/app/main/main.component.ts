import { animate, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('componentLoaded', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
    ]),
  ],
})
export class MainComponent implements OnInit {
  loadingApp = true
  constructor() {}

  ngOnInit(): void {
    console.log('MainComponent INIT')
    setTimeout(() => (this.loadingApp = false), 1000)
  }
}
