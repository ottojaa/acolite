# Introduction

Acolite is a local file management system and text editor made with ElectronJS 13.1.7 and Angular 12. Main focus of the application is to increase productivity when it comes to maintaining text, pdf, markdown, image, JSON and other files.

### Features

- Create and manage files conveniently
- Dedicated file viewers / editors for: **Text**, **Image**, **Markdown**, **PDF**, **JSON**
  - Markdown editor with full syntax highlighting and live preview
    - Image editor with basic cropping functionality
    - JSON editor with syntax highlight and lint, coupled with object viewer
- Full file tree functionality: multiple selection, keyboard navigation, file/folder creation, drag and drop (both in and outside of application), filtering, rename & delete
- File contents are automatically indexed using flex-search: real time search using file name, path and content (configurable)
  - However pdf and other very large files' content is not indexed due to high performance impact
- File bookmarking
- Workspaces: change workspace directory at any time
- Persistent state

### Markdown Editor

![Alt text](/samples/markdown_sample.png?raw=true 'Markdown')

### Image Cropper

![Alt text](/samples/cropper_sample.png?raw=true 'Image cropper')

### JSON Editor

![Alt text](/samples/json_sample.png?raw=true 'JSON Editor')

### Content search

![Alt text](/samples/search.png?raw=true 'Search')
