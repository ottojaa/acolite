import { Component, OnInit } from '@angular/core'
import * as faker from 'faker'
import { fileExtensionIcons } from '../../../constants'

class File {
  name: string
  extension: string
  content: string
  filePath: string
  iconName: string | undefined
  highlightContentText?: string | undefined
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent implements OnInit {
  openDrop: boolean = false
  selectedItem: File
  files: File[] = []
  filterFiles: File[] = []
  constructor() {}

  ngOnInit(): void {
    for (let index = 0; index < 100; index++) {
      const file = new File()
      file.name = faker.system.commonFileName()
      file.filePath = faker.system.directoryPath()
      file.content = faker.lorem.lines(2)
      file.extension = file.name.split('.')[1]
      file.iconName = this.getFileExtensionIconName(file.extension)

      this.files.push(file)
    }
  }

  onOpenDrop(state: boolean) {
    this.openDrop = state
  }

  getFileExtensionIconName(extension: string | undefined): string | null {
    if (!extension) {
      return 'folder'
    }
    const icon = fileExtensionIcons.find((e) =>
      e.acceptedExtensions.includes(extension)
    )
    return icon ? icon.name : null
  }

  onSelectItem(File: File) {
    this.selectedItem = File
  }

  onSearchFiles(value: string) {
    value = (value || '').toLowerCase()
    if (!value || value.length < 3) {
      this.filterFiles = []
      return
    }

    this.filterFiles = this.files
      .filter((f) => {
        const name = f.name.toLowerCase()
        const extension = f.extension.toLowerCase()
        const filePath = f.filePath.toLowerCase()
        const content = f.content.toLowerCase()

        return (
          name.includes(value) ||
          extension.includes(value) ||
          filePath.includes(value) ||
          content.includes(value)
        )
      })
      .map((file) => {
        if (file.content) {
          file.highlightContentText = this.getHighlightText(file.content, value)
        }

        return file
      })
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
    const highlightEndIndex = highlightText.lastIndexOf('</span>') + 7 // length of '</span>'
    const highlightString = highlightText.substring(
      highlightStartIndex,
      highlightEndIndex
    )
    let prefix = highlightText.substring(0, highlightStartIndex - 1)
    let suffix = highlightText.substring(
      highlightEndIndex + 1,
      highlightText.length
    )

    const shouldTruncateString = (string: string) => string.length > 60

    if (shouldTruncateString(prefix)) {
      prefix = '...' + shorten(prefix, 60)
    }
    if (shouldTruncateString(suffix)) {
      suffix = shorten(suffix, 60) + '...'
    }
    return prefix + ' ' + highlightString + ' ' + suffix
  }
}
