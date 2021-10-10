import { Component, ElementRef, Input, OnInit } from '@angular/core'
import { FileEntity } from '../../../../interfaces/File'
import canvasText from 'canvas-txt'

@Component({
  selector: 'app-file-card',
  templateUrl: './file-card.component.html',
  styleUrls: ['./file-card.component.scss'],
})
export class FileCardComponent implements OnInit {
  @Input() file: FileEntity

  imageUrl: string

  ngOnInit(): void {
    this.generateCanvasContent()
  }

  generateCanvasContent(): void {
    const canvas = this.createContext('1198', '1688')
    const ctx = canvas.getContext('2d')
    const text = this.file.content
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 1198, 1688)
    ctx.fillStyle = 'black'
    canvasText.fontSize = 50
    canvasText.vAlign = 'top'
    canvasText.align = 'left'
    canvasText.drawText(ctx, text, 30, 30, 1198, 1688)

    this.imageUrl = canvas.toDataURL()
  }

  createContext(width: string, height: string): HTMLCanvasElement {
    var c = document.createElement('canvas')
    c.setAttribute('width', width)
    c.setAttribute('height', height)
    return c
  }
}
