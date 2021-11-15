import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core'
import * as faker from 'faker'
import { SearchResponses, StoreResponses } from '../../../../../app/actions'
import { ElectronService } from '../../../core/services'
import { fileExtensionIcons } from '../../../entities/file/constants'

class File {
  name: string
  extension: string
  content: string
  filePath: string
  iconName: string | undefined
  createdDate: string
  modifiedDate: string
  highlightContentText?: string | undefined
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent {
  openDrop: boolean = false
  selectedItem: File
  filterFiles: File[] = []
  searchQuery: string

  constructor(private electronService: ElectronService, public zone: NgZone, public cdRef: ChangeDetectorRef) {
    this.zone.run(() => {
      console.log(this.searchQuery)
      this.electronService.on(SearchResponses.QuerySuccess, (_ipcEvent: Electron.IpcMessageEvent, results: any) => {
        this.filterFiles = [
          ...results.map((file: File) => {
            if (file.content) {
              file.highlightContentText = this.getHighlightText(file.content, this.searchQuery)
            }

            return file
          }),
        ]
        this.cdRef.detectChanges()
      })
    })
  }

  onOpenDrop(state: boolean) {
    this.openDrop = state
  }

  trackByPath(_index: number, file: File): string {
    return file.filePath
  }

  getFileExtensionIconName(extension: string | undefined): string | null {
    if (!extension) {
      return 'folder'
    }
    const icon = fileExtensionIcons.find((e) => e.acceptedExtensions.includes(extension))
    return icon ? icon.name : null
  }

  onSelectItem(file: File) {
    this.selectedItem = file
  }

  onSearchFiles() {
    const value = (this.searchQuery || '').toLowerCase()
    if (!value || value.length < 3) {
      this.filterFiles = []
      return
    }
    this.electronService.searchFiles({ searchOpts: { content: value } })

    /* this.filterFiles = this.files
      .filter((f) => {
        const name = f.name.toLowerCase()
        const extension = f.extension.toLowerCase()
        const filePath = f.filePath.toLowerCase()
        const content = f.content.toLowerCase()

        return name.includes(value) || extension.includes(value) || filePath.includes(value) || content.includes(value)
      })
      .map((file) => {
        if (file.content) {
          file.highlightContentText = this.getHighlightText(file.content, value)
        }

        return file
      }) */
  }

  /**
   * generates a highlight text that is shown alongside other file data. Attempts to truncate the text while keeping the highlighted part intact
   * @param textContent the file's text content
   * @param query search query
   */
  getHighlightText(textContent: string, query: string): string {
    if (!textContent) {
      return ''
    }
    const highlightText = textContent.replace(
      new RegExp(query, 'gi'),
      (match) => '<span class="highlightText">' + match + '</span>'
    )

    const length = highlightText.length
    if (length < 80) {
      return highlightText
    }

    const shorten = (str: string, maxLen: number, separator = ' ') => {
      if (str.length <= maxLen) return str
      return str.substr(0, str.lastIndexOf(separator, maxLen))
    }

    const highlightStartIndex = highlightText.indexOf('<span ')
    const highlightEndIndex = highlightText.indexOf('</span>') + 7 // length of '</span>'
    const highlightString = highlightText.substring(highlightStartIndex, highlightEndIndex)
    let prefix = highlightText.substring(0, highlightStartIndex - 1)
    let suffix = highlightText.substring(highlightEndIndex + 1, highlightText.length)

    const shouldTruncateString = (string: string) => string.length > 90

    if (shouldTruncateString(prefix)) {
      prefix = '...' + shorten(prefix, 90)
    }
    if (shouldTruncateString(suffix)) {
      suffix = shorten(suffix, 90) + '...'
    }
    return prefix + ' ' + highlightString + ' ' + suffix
  }
}
