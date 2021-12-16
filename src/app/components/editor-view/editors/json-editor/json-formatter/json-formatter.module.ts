import { NgModule } from '@angular/core'
import { JsonFormatterComponent } from './json-formatter.component'
import { CommonModule } from '@angular/common'

@NgModule({
  imports: [CommonModule],
  exports: [JsonFormatterComponent],
  declarations: [JsonFormatterComponent],
  providers: [],
})
export class JsonFormatterModule {}
