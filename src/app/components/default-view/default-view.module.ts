import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DefaultViewComponent } from "./default-view.component";

@NgModule({
  declarations: [DefaultViewComponent],
  exports: [DefaultViewComponent],
  imports: [CommonModule],
})
export class DefaultViewModule {}
