import { State } from './interfaces'

interface FileExtensionIcon {
  name: string
  acceptedExtensions: string[]
  color?: string
}

export const nameValidationPattern = '^[-A-Za-z0-9_-ñÑáéíóúÁÉÍÓÚäöüÄÖÜß. ]+$'
export const extensionValidationPattern = '^[a-z]+$'

export const allowedTextEditorExtensions = ['txt', 'text', 'html', 'yml', 'doc', 'docx']
export const allowedMarkdownEditorExtensions = ['markdown', 'md']

export const fileExtensionIcons: FileExtensionIcon[] = [
  { name: 'file-image-outline', acceptedExtensions: ['jpg', 'jpeg', 'png', 'img'], color: '#65ff87' },
  { name: 'file-document-outline', acceptedExtensions: ['txt', 'text'], color: '#68c6f3' },
  { name: 'language-markdown', acceptedExtensions: ['mdown', 'markdown', 'md'], color: 'white' },
  { name: 'file-word-outline', acceptedExtensions: ['doc', 'docx'], color: 'deepskyblue' },
  { name: 'file-powerpoint-outline', acceptedExtensions: ['ppt', 'pptx', 'pps'], color: '#C03314' },
  { name: 'file-pdf-box', acceptedExtensions: ['pdf'], color: '#DA554A' },
  { name: 'code-json', acceptedExtensions: ['json'], color: 'yellow' },
  { name: 'language-javascript', acceptedExtensions: ['js'], color: 'yellow' },
  { name: 'folder', acceptedExtensions: ['folder'] },
  { name: 'file-document', acceptedExtensions: ['default'], color: 'white' },
]

export const editorTypes = [
  {
    editor: 'txt',
    acceptedTypes: ['txt', 'text', 'html', 'yml', 'doc', 'docx', 'yaml'],
  },
  { editor: 'md', acceptedTypes: ['markdown', 'md'] },
  { editor: 'pdf', acceptedTypes: ['pdf'] },
  { editor: 'json', acceptedTypes: ['json'] },
  { editor: 'image', acceptedTypes: ['jpg', 'jpeg', 'png', 'bmp', 'ico', 'webp'] },
]

export enum EntityTypes {
  File = 'file',
  Folder = 'folder',
}

// Types that should be encoded / decoded with encoding: 'binary'. Base64 seems to cause performance problems with async FS api readFile api
export const binaryTypes = ['pdf', 'jpg', 'jpeg', 'png', 'ico', 'bmp', 'webp']

export const defaultSpliceLength = 50

export const allowedConfigKeys: string[] = [
  'baseDir',
  'tabs',
  'sideMenuWidth',
  'editorTheme',
  'selectedTab',
  'searchPreferences',
  'bookmarks',
]
