import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

@NgModule({
  imports: [CommonModule, MatMenuModule, MatIconModule, MatMenuModule],
  exports: [MatButtonModule, MatIconModule, MatMenuModule],
})
export class AppMaterialModule {}
