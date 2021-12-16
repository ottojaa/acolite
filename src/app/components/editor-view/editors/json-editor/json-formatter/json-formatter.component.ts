import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core'
import { getObjectName, getPreview, getType, getValuePreview } from './formatter-utils'

const JSONFormatterConfig = {
  hoverPreviewEnabled: false,
  hoverPreviewArrayCount: 100,
  hoverPreviewFieldCount: 5,
}

@Component({
  selector: 'app-json-formatter',
  templateUrl: './json-formatter.component.html',
  styleUrls: ['./json-formatter.component.scss'],
})
export class JsonFormatterComponent implements OnInit {
  @Input() set json(value: any) {
    this._json = value
    this.initParams()
  }
  @Input() key: string
  @Input() forceOpen: boolean
  @Input() open: number
  @Input() isValid: boolean
  @ViewChildren('formatter') formatters: QueryList<JsonFormatterComponent>
  _json: any
  isArray: boolean
  isObject: boolean
  isUrl: boolean
  isDate: boolean
  type: any

  hasKey: boolean
  keys: string[]
  isOpen: boolean
  constructorName: string

  get json() {
    return this._json
  }

  ngOnInit() {
    this.initParams()
  }

  initParams(): void {
    this.isArray = Array.isArray(this.json)
    this.isObject = this.json != null && typeof this.json === 'object'
    this.type = getType(this.json)
    this.hasKey = typeof this.key !== 'undefined'
    this.isOpen = this.open && this.open > 0

    this.constructorName = getObjectName(this.json)
    if (this.isObject) {
      this.keys = Object.keys(this.json).map((key) => (key === '' ? '""' : key))
    }
    if (this.type === 'string') {
      if (new Date(this.json).toString() !== 'Invalid Date') {
        this.isDate = true
      }
      if (this.json.indexOf('http') === 0) {
        this.isUrl = true
      }
    }
  }

  isEmptyObject() {
    return this.keys && !this.keys.length && this.isOpen && !this.isArray
  }

  toggleOpen() {
    this.isOpen = !this.isOpen
  }

  childrenOpen() {
    return this.open > 1 ? this.open - 1 : 0
  }

  openLink(isUrl: boolean) {
    if (isUrl) {
      // window.location.href = this.json
    }
  }

  parseValue(value) {
    return getValuePreview(this.json, value)
  }

  showThumbnail() {
    return this.isObject && !this.isOpen
  }

  getThumbnail() {
    if (this.isArray) {
      if (this.json.length > JSONFormatterConfig.hoverPreviewArrayCount) {
        return 'Array[' + this.json.length + ']'
      } else {
        return '[' + this.json.map(getPreview).join(', ') + ']'
      }
    } else {
      // the first five keys (like Chrome Developer Tool)
      const narrowKeys = this.keys.slice(0, JSONFormatterConfig.hoverPreviewFieldCount)
      // json value schematic information
      const kvs = narrowKeys.map((key) => key + ':' + getPreview(this.json[key]))

      // if keys count greater then 5 then show ellipsis
      const ellipsis = this.keys.length >= 5 ? '…' : ''

      return '{' + kvs.join(', ') + ellipsis + '}'
    }
  }

  trackByFn(i) {
    return i
  }
}
