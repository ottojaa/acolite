import { Component, Input, OnInit } from '@angular/core'
import { fileExtensionIcons } from 'app/entities/file/constants'

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
})
export class IconComponent implements OnInit {
  @Input() extension?: string
  @Input() scale?: number = 0.8
  iconName: string
  iconColor: string = 'white'
  scaleString: string

  constructor() {}

  ngOnInit(): void {
    if (!this.extension) {
      this.iconName = 'file-document'
      return
    }
    this.setIconAttributes(this.extension)
  }

  setIconAttributes(extension: string): void {
    this.scaleString = `transform: scale(${this.scale.toString()})`

    const extString = extension.replace('.', '')
    const icon = fileExtensionIcons.find((icon) => icon.acceptedExtensions.includes(extString))

    if (!icon) {
      this.iconName = 'file-document'
    } else {
      this.iconName = icon.name
      this.iconColor = icon.color
    }
  }
}