import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SideMenuComponent } from "./side-menu.component";
import { TreeModule } from "primeng/tree";
import { TreeDragDropService } from "primeng/api";

@NgModule({
  declarations: [SideMenuComponent],
  exports: [SideMenuComponent],
  providers: [TreeDragDropService],
  imports: [CommonModule, TreeModule],
})
export class SideMenuModule {}
