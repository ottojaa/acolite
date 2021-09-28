import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MainRoutingModule } from "./main-routing.module";

import { SharedModule } from "../shared/shared.module";
import { MainComponent } from "./main.component";
import { SideMenuModule } from "../components/side-menu/side-menu.module";
import { TopBarModule } from "../components/top-bar/top-bar/top-bar.module";
import { DefaultViewModule } from "../components/default-view/default-view.module";
import { SplitterModule } from "primeng/splitter";
import { PanelModule } from "primeng/panel";
import { BrowserModule } from "@angular/platform-browser";
import { ScrollPanelModule } from "primeng/scrollpanel";

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    SharedModule,
    MainRoutingModule,
    SideMenuModule,
    TopBarModule,
    DefaultViewModule,
    SplitterModule,
    ScrollPanelModule,
    PanelModule,
    BrowserModule,
  ],
})
export class DetailModule {}
