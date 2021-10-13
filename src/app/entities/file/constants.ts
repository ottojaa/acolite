interface FileExtensionIcon {
  name: string
  acceptedExtensions: string[]
}

export const fileExtensionIcons: FileExtensionIcon[] = [
  { name: 'image', acceptedExtensions: ['jpg', 'jpeg', 'png', 'img'] },
  { name: 'txt', acceptedExtensions: ['txt', 'text'] },
  { name: 'markdown', acceptedExtensions: ['mdown', 'markdown', 'md'] },
  { name: 'word', acceptedExtensions: ['doc', 'docx'] },
  { name: 'powerpoint', acceptedExtensions: ['ppt', 'pptx', 'pps'] },
  { name: 'pdf', acceptedExtensions: ['pdf'] },
  { name: 'json', acceptedExtensions: ['json'] },
  { name: 'js', acceptedExtensions: ['js'] },
  { name: 'folder', acceptedExtensions: ['folder'] },
]

export enum EntityTypes {
  File = 'file',
  Folder = 'folder',
}

export enum FileActions {
  Create = 'create-file',
  Rename = 'rename-file',
  Delete = 'delete',
  Paste = 'paste-file',
  Copy = 'copy-file',
  Cut = 'cut-file',
  OpenInFolder = 'open-file-in-folder',
  ModifyTags = 'modify-tags',
}

export enum FileActionResponses {
  CreateSuccess = 'create-file-success',
  CreateFailure = 'create-file-failure',
}
