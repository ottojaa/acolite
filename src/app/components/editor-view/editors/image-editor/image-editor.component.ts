import { animate, keyframes, style, transition, trigger } from '@angular/animations'
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { AbstractEditor } from 'app/abstract/abstract-editor'
import { ElectronService } from 'app/core/services'
import { StateService } from 'app/services/state.service'
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper'
import { getBaseName } from '../../../../../../app/electron-utils/file-utils'
import { nameValidationPattern } from '../../../../../../app/shared/constants'
import { Doc } from '../../../../../../app/shared/interfaces'

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

  fileName = new FormControl('', [Validators.required, Validators.pattern(nameValidationPattern)])
  croppedImage: any = ''
  isChecked: boolean
  notEditing = true
  imagePath: SafeResourceUrl
  imageBase64: string

  editMode = true
  maintainAspectRatio = true
  imageQuality = 100
  selectedFormat: string
  originalImageDimensions: { width: number; height: number } = { width: undefined, height: undefined }
  croppedImageDimensions: { width: number; height: number } = { width: undefined, height: undefined }

  imageRotation: number
  imageScale: number

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

  constructor(public electronService: ElectronService, public state: StateService, public cdRef: ChangeDetectorRef) {
    super(electronService, state)
  }

  ngOnInit(): void {
    this.initData()
    this.getImageBase64()
    this.themeListener().subscribe((data) => (this.isChecked = data === 'light'))
  }

  initData(): void {
    const acceptedFormats = ['png', 'jpeg', 'jpg', 'webp', 'bmp', 'ico']
    this.selectedFormat =
      this.tab.extension === 'jpg' ? 'jpeg' : acceptedFormats.includes(this.tab.extension) ? this.tab.extension : ''

    const baseName = getBaseName(this.tab.filePath).split('.')[0]
    this.fileName.setValue(baseName + `_cropped_${new Date().toISOString()}`)
  }

  async getImageBase64(): Promise<void> {
    this.imagePath = await this.electronService.getImageData({ filePath: this.tab.filePath })
    this.imageBase64 = `data:image/png;base64,${this.imagePath}`
    this.cdRef.detectChanges()
  }

  imageCropped(event: ImageCroppedEvent) {
    const { base64, height, width } = event
    this.croppedImage = base64
    this.croppedImageDimensions.height = height
    this.croppedImageDimensions.width = width
  }
  imageLoaded(image: LoadedImage) {
    const { original } = image
    const { width, height } = original.size
    this.originalImageDimensions.width = width
    this.originalImageDimensions.height = height
    // show cropper
  }
  cropperReady() {
    console.log('cropper')
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode
  }

  onChange(event: any): void {
    console.log(event)
  }
}
