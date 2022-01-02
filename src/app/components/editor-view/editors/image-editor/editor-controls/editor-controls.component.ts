import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MatSliderChange } from '@angular/material/slider'
import { ElectronService } from 'app/core/services'
import { ImageTransform } from 'ngx-image-cropper'
import { getBaseName } from '../../../../../../../app/electron-utils/file-utils'
import { nameValidationPattern } from '../../../../../../../app/shared/constants'
import { Dimensions } from '../interfaces'

@Component({
  selector: 'app-editor-controls',
  templateUrl: './editor-controls.component.html',
  styleUrls: ['./editor-controls.component.scss'],
})
export class EditorControlsComponent implements OnInit {
  @Input() filePath: string
  @Input() imageTransform: ImageTransform
  @Input() originalImageDimensions: Dimensions
  @Input() croppedImageDimensions: Dimensions
  @Input() selectedFormat: string
  @Input() outputPath: string
  @Input() basePath: string
  @Input() maintainAspectRatio: boolean
  @Input() imageQuality: number

  @Output() updateImageTransform = new EventEmitter<Partial<ImageTransform>>()
  @Output() chooseOutputPath = new EventEmitter<string>()
  @Output() changeMaintainAspectRatio = new EventEmitter<boolean>()
  @Output() onChangeQuality = new EventEmitter<number>()
  @Output() toggleEditMode = new EventEmitter()
  @Output() save = new EventEmitter()

  formats = [
    {
      displayName: 'Png',
      value: 'png',
    },
    {
      displayName: 'Jpeg',
      value: 'jpeg',
    },
    {
      displayName: 'Webp',
      value: 'webp',
    },
    {
      displayName: 'Bmp',
      value: 'bmp',
    },
    {
      displayName: 'Ico',
      value: 'ico',
    },
  ]

  fileName = new FormControl('', [Validators.required])

  constructor(public electronService: ElectronService) {}

  ngOnInit(): void {
    const baseName = getBaseName(this.filePath).split('.')[0]
    this.fileName.setValue(baseName + `_${new Date().toISOString()}`)
  }

  flip(direction: 'horizontal' | 'vertical'): void {
    const { flipH, flipV } = this.imageTransform

    direction === 'horizontal'
      ? this.updateImageTransform.emit({ flipH: !flipH })
      : this.updateImageTransform.emit({ flipV: !flipV })
  }

  rotate(direction: 'pos' | 'neg'): void {
    const calc = (num: number) => this.calcRotation(this.imageTransform.rotate, num)
    const rotate = direction === 'pos' ? calc(45) : calc(-45)
    this.updateImageTransform.emit({ rotate })
  }

  onChangeScale(event: MatSliderChange): void {
    this.updateImageTransform.emit({ scale: event.value })
  }

  calcRotation(curr: number, rotation: number): number {
    if (curr + rotation < 0 || curr + rotation > 360) {
      return Math.abs(curr + rotation - (315 + rotation))
    }
    return Math.abs(curr + rotation)
  }

  async onChooseDir(): Promise<void> {
    const chosenDir = await this.electronService.getDirectoryPath({ filePath: this.filePath })
    if (chosenDir) {
      this.chooseOutputPath.emit(chosenDir)
    }
  }

  onClickEditMode(): void {
    this.toggleEditMode.emit()
  }

  onChangeImageQuality(change: MatSliderChange): void {
    this.onChangeQuality.emit(change.value)
  }

  onChangeMaintainAspectRatio(value: boolean): void {
    this.changeMaintainAspectRatio.emit(value)
  }

  onSaveClick(): void {
    const name = this.fileName.value + '.' + this.selectedFormat
    this.save.emit(name)
  }
}
