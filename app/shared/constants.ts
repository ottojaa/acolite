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
  { name: 'image', acceptedExtensions: ['jpg', 'jpeg', 'png', 'img'], color: '#65ff87' },
  { name: 'file-document-outline', acceptedExtensions: ['txt', 'text'], color: '#68c6f3' },
  { name: 'language-markdown', acceptedExtensions: ['mdown', 'markdown', 'md'], color: 'white' },
  { name: 'file-word-outline', acceptedExtensions: ['doc', 'docx'], color: 'deepskyblue' },
  { name: 'file-powerpoint-outline', acceptedExtensions: ['ppt', 'pptx', 'pps'], color: '#C03314' },
  { name: 'file-pdf-box', acceptedExtensions: ['pdf'], color: '#DA554A' },
  { name: 'code-json', acceptedExtensions: ['json'], color: 'yellow' },
  { name: 'css', acceptedExtensions: ['css'] },
  { name: 'scss', acceptedExtensions: ['scss'] },
  { name: 'html', acceptedExtensions: ['html'] },
  { name: 'language-javascript', acceptedExtensions: ['js'], color: 'yellow' },
  { name: 'typescript', acceptedExtensions: ['ts'] },
  { name: 'folder', acceptedExtensions: ['folder'] },
  { name: 'default-document', acceptedExtensions: ['default'], color: 'white' },
]

export const editorConfigs = [
  {
    editorType: 'txt',
    encoding: 'utf-8',
    acceptedTypes: ['txt', 'text', 'html', 'yml', 'doc', 'docx', 'yaml', 'csv', 'js', 'ts', 'css', 'scss'],
  },
  { editorType: 'md', encoding: 'utf-8', acceptedTypes: ['markdown', 'md'] },
  { editorType: 'pdf', encoding: 'base64', acceptedTypes: ['pdf'] },
  { editorType: 'json', encoding: 'utf-8', acceptedTypes: ['json'] },
  { editorType: 'image', encoding: 'base64', acceptedTypes: ['jpg', 'jpeg', 'png', 'bmp', 'ico', 'webp'] },
]

export enum EntityTypes {
  File = 'file',
  Folder = 'folder',
}

export const indexFileTypes = ['txt', 'md', 'markdown', 'json', 'ts', 'js', 'css', 'scss', 'csv']

// Types that should be encoded / decoded with encoding: 'binary'. Base64 seems to cause performance problems with async FS api readFile api
export const binaryTypes = ['pdf', 'jpg', 'jpeg', 'png', 'ico', 'bmp', 'webp']
export const imageTypes = ['png', 'jpeg', 'jpg', 'ico', 'bmp', 'webp', 'ai', 'eps']
export const indexFileSizeLimit = 100000

export const defaultSpliceLength = 50

export const allowedConfigKeys: string[] = [
  'baseDir',
  'tabs',
  'sideMenuWidth',
  'editorTheme',
  'selectedTab',
  'searchPreferences',
  'bookmarks',
  'appTheme',
]
