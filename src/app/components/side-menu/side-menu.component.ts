import { Component, OnInit } from "@angular/core";
import { TreeNode } from "primeng/api";
import { MenuService } from "../../services/menu.service";

@Component({
  selector: "app-side-menu",
  templateUrl: "./side-menu.component.html",
  styleUrls: ["./side-menu.component.scss"],
})
export class SideMenuComponent implements OnInit {
  files: TreeNode[];

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.getMenuItems().then((files) => (this.files = files));
  }
}
