import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { EditorTopBarComponent } from './editor-top-bar.component'

@NgModule({
  declarations: [EditorTopBarComponent],
  exports: [EditorTopBarComponent],
  imports: [CommonModule, MatIconModule, FormsModule, ReactiveFormsModule, MatInputModule, MatSlideToggleModule],
})
export class EditorTopBarModule {}
