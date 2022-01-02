import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ImageCroppedEvent, ImageTransform, LoadedImage, OutputFormat } from 'ngx-image-cropper'
import { Dimensions } from '../interfaces'

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
})
export class ImageCropperComponent implements OnInit {
  @Input() editMode: boolean
  @Input() imageBase64: string
  @Input() imageQuality: number
  @Input() selectedFormat: OutputFormat
  @Input() imageTransform: ImageTransform
  @Input() maintainAspectRatio: boolean
  @Input() croppedImageDimensions: Dimensions
  @Input() originalImageDimensions: Dimensions

  @Output() originalDimensions = new EventEmitter<Dimensions>()
  @Output() croppedDimensions = new EventEmitter<Dimensions>()
  @Output() croppedImage = new EventEmitter<string>()

  cropperIsReady = false

  constructor() {}

  ngOnInit(): void {}

  imageCropped(event: ImageCroppedEvent) {
    const { base64, height, width } = event
    this.croppedImage.emit(base64)
    this.croppedDimensions.emit({ height, width })
  }
  imageLoaded(image: LoadedImage) {
    const { original } = image
    const { width, height } = original.size
    this.originalDimensions.emit({ height, width })
  }

  cropperReady() {
    this.cropperIsReady = true
  }
}
