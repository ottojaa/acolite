import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { fileExtensionIcons } from '../../../../../app/shared/constants'

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnInit {
  @Input() extension?: string
  @Input() scale?: number = 0.8
  iconName: string
  iconColor = 'white'
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
    const icon = fileExtensionIcons.find((extensionIcon) => extensionIcon.acceptedExtensions.includes(extString))

    if (!icon) {
      this.iconName = 'file-document'
    } else {
      this.iconName = icon.name
      this.iconColor = icon.color
    }
  }
}
