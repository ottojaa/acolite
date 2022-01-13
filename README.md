# Introduction

Acolite is a local file management system and editor made with ElectronJS 13.1.7 and Angular 12 that helps you keep your important notes and files in a single centralized location. Create new files and edit them in the app or drag and drop existing files from your file system. All text files are fully indexed and you can find them easily by searching for their text content, so not remembering a file's name is not an issue. 

### Main features

- Create and manage files conveniently
- Dedicated file viewers / editors:
  - **Text** editor
  - **Markdown** editor with full syntax highlighting and live preview
  - **Image** editor with basic cropping functionality
  - **JSON** editor with syntax highlight and lint, coupled with object viewer
  - **PDF** viewer


- Full file tree functionality: multiple selection, keyboard navigation, file/folder creation, drag and drop (both in and outside of application), filtering, rename & delete
- File contents are automatically indexed using flex-search: real time search using file name, path and content (configurable)
  - However pdf and other very large files' content is not indexed due to high performance impact
- Automatic updates
- Bookmarks
- Workspaces
- Persistent state and workspace settings


### Known issues
- Choosing very large folder structures as your workspace directory (such as your documents folder) will crash the app due to electron running out of memory. If this happens to you, the fix is to delete the `acolite.config.json` file. You can find this file in:
  - **Windows**: `~/%APPDATA%/Roaming/acolite/acolite.config.json`
  - **Mac**: `~/Library/Application Support/acolite/acolite.config.json`



# Examples

### Markdown Editor

![Alt text](/samples/markdown_sample.png?raw=true 'Markdown')

### Image Cropper

![Alt text](/samples/image_cropper_sample.png?raw=true 'Image cropper')

### JSON Editor

![Alt text](/samples/json_sample.png?raw=true 'JSON Editor')

### Content search

![Alt text](/samples/search.png?raw=true 'Search')
