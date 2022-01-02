import { animate, keyframes, style, transition, trigger } from '@angular/animations'
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { AbstractEditor } from 'app/abstract/abstract-editor'
import { ElectronService } from 'app/core/services'
import { StateService } from 'app/services/state.service'
import { ImageTransform, OutputFormat } from 'ngx-image-cropper'
import { getDirName, getJoinedPath } from '../../../../../../app/electron-utils/file-utils'
import { Doc } from '../../../../../../app/shared/interfaces'
import { Dimensions } from './interfaces'

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss'],
  animations: [
    trigger('componentLoaded', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('.3s ease-in', keyframes([style({ opacity: 0 }), style({ opacity: 1 })])),
      ]),
    ]),
  ],
})
export class ImageEditorComponent extends AbstractEditor implements OnInit {
  @Input() tab: Doc

  fileName: string
  croppedImage: any = ''
  isChecked: boolean
  imagePath: string
  imageBase64: string

  cropperIsReady = false
  editMode = false
  maintainAspectRatio = false
  imageQuality = 100
  selectedFormat: OutputFormat
  originalImageDimensions: Dimensions = { width: undefined, height: undefined }
  croppedImageDimensions: Dimensions = { width: undefined, height: undefined }

  canvasRotation = 0
  imageTransform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false,
  }

  basePath: string
  outputPath: string

  constructor(public electronService: ElectronService, public state: StateService, public cdRef: ChangeDetectorRef) {
    super(electronService, state)
  }

  ngOnInit(): void {
    this.initData()
    this.getImageBase64()
    this.themeListener().subscribe((data) => (this.isChecked = data === 'light'))
  }

  initData(): void {
    const getFormat = (extension: string): OutputFormat => {
      const acceptedFormats = ['png', 'jpeg', 'webp', 'bmp', 'ico']
      const selectedFormat = extension === 'jpg' ? 'jpeg' : acceptedFormats.includes(extension) ? extension : ''
      return selectedFormat as OutputFormat
    }

    this.selectedFormat = getFormat(this.tab.extension)
    this.outputPath = getDirName(this.tab.filePath)
    this.basePath = this.state.getStatePartValue('baseDir')
  }

  async getImageBase64(): Promise<void> {
    this.imagePath = await this.electronService.getImageData({ filePath: this.tab.filePath })
    this.imageBase64 = `data:image/png;base64,${this.imagePath}`
    this.cdRef.detectChanges()
  }

  updateCroppedDimensions(dimensions: Dimensions) {
    this.croppedImageDimensions = { ...dimensions }
  }

  updateOriginalDimensions(dimensions: Dimensions) {
    this.originalImageDimensions = { ...dimensions }
  }

  updateImageTransform(args: Partial<ImageTransform>): void {
    this.imageTransform = { ...this.imageTransform, ...args }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode
  }

  onChooseOutputPath(path: string): void {
    this.outputPath = path
  }

  onCrop(base64: string): void {
    this.croppedImage = base64
  }

  onChangeQuality(quality: number): void {
    this.imageQuality = quality
  }

  onChangeMaintainAspectRatio(value: boolean): void {
    this.maintainAspectRatio = value
  }

  onClickSave(filename: string): void {
    const newFilePath = getJoinedPath([this.outputPath, filename])
    const payload = {
      filePath: newFilePath,
      content: this.croppedImage,
      state: this.state.value,
    }

    this.electronService.createNewImageRequest(payload)
  }
}