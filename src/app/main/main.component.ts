import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit {
  textii: string;
  constructor() {}

  ngOnInit(): void {
    console.log("MainComponent INIT");
  }

  onResizeEnd(event: any): void {
    console.log(event);
  }
}
