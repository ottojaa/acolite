import { State } from '../../services/state.service'

interface FileExtensionIcon {
  name: string
  acceptedExtensions: string[]
  color?: string
}

export const nameValidationPattern = '^[-A-Za-z0-9_-ñÑáéíóúÁÉÍÓÚäöüÄÖÜß ]+$'

export const fileExtensionIcons: FileExtensionIcon[] = [
  { name: 'file-image-outline', acceptedExtensions: ['jpg', 'jpeg', 'png', 'img'], color: '#65ff87' },
  { name: 'file-document-outline', acceptedExtensions: ['txt', 'text'], color: '#a4c4ff' },
  { name: 'language-markdown', acceptedExtensions: ['mdown', 'markdown', 'md'], color: 'white' },
  { name: 'file-word-outline', acceptedExtensions: ['doc', 'docx'], color: 'deepskyblue' },
  { name: 'file-powerpoint-outline', acceptedExtensions: ['ppt', 'pptx', 'pps'], color: '#C03314' },
  { name: 'file-pdf-box', acceptedExtensions: ['pdf'], color: '#DA554A' },
  { name: 'code-json', acceptedExtensions: ['json'], color: 'yellow' },
  { name: 'language-javascript', acceptedExtensions: ['js'], color: 'yellow' },
  { name: 'folder', acceptedExtensions: ['folder'] },
  { name: 'file-document', acceptedExtensions: ['default'], color: 'white' },
]

export enum EntityTypes {
  File = 'file',
  Folder = 'folder',
}

export const allowedConfigKeys: (keyof State)[] = [
  'baseDir',
  'tabs',
  'sideMenuWidth',
  'editorTheme',
  'selectedTab',
  'searchPreferences',
  'bookmarks',
]
