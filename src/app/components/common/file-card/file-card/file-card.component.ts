import { Component, Input, OnInit } from '@angular/core'
import canvasText from 'canvas-txt'
import { fileExtensionIcons } from 'app/entities/file/constants'
import { FileEntity, SearchResult } from 'app/interfaces/Menu'
import { TabService } from 'app/services/tab.service'

@Component({
  selector: 'app-file-card',
  templateUrl: './file-card.component.html',
  styleUrls: ['./file-card.component.scss'],
})
export class FileCardComponent implements OnInit {
  @Input() file: SearchResult

  constructor(private tabService: TabService) {}

  imageUrl: string
  lorps = fileExtensionIcons

  ngOnInit(): void {
    // this.generateCanvasContent()
  }

  openInNewTab(file: FileEntity): void {
    this.tabService.openNewTab(file.filePath)
  }
}
