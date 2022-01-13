# Introduction

Acolite is a local file management system and editor made with ElectronJS 13.1.7 and Angular 12 that helps you keep your important notes and files in a single centralized subset of your file system. Organize files easily by creating folders and subfolders dedicated to a certain purpose, and/or bookmark especially important files to find them quickly when you need them.

Create new files and edit them in the app or drag and drop existing files from your file system. Text files are fully indexed and you can find them easily by searching for their text content, so not remembering a file's name is not an issue.

Download links for the latest release can be found [here](https://github.com/ottojaa/acolite/releases)

### Main features

- Create and manage files conveniently
- Dedicated file viewers / editors:
  - **Text** editor
  - **Markdown** editor with full syntax highlighting and live preview
  - **Image** editor with basic cropping functionality
  - **JSON** editor with syntax highlight and lint, coupled with object viewer
  - **PDF** viewer


- Full file tree functionality: multiple selection, keyboard navigation, file/folder creation, drag and drop (both in and outside of application), filtering, rename & delete
- Search and find files quickly by searching for file name, content or path
  - All text files contents are indexed so finding a file is quick even if you don't remember the file's name, but do remember the contents 
    - This includes text, csv, json and markdown and other purely text based files 
- Automatic updates
- Bookmarks
- Workspaces
- Persistent state and workspace settings

### Roadmap
- File content previews in the dashboard
- Backup service so you can access your files from any machine
- Support and dedicated editors for more file types
- Implement chokidar and decouple file indexing from the core logic of the application
- More customisability in form of settings


### Known issues
- Choosing very large folder structures as your workspace directory (such as your documents folder) will crash the app due to electron running out of memory. If this happens to you, the fix is to delete the `acolite.config.json` file. You can find this file in:
  - **Windows**: `~/%APPDATA%/Roaming/acolite/acolite.config.json`
  - **Mac**: `~/Library/Application Support/acolite/acolite.config.json`

- Creating / renaming files should not be as restrictive as it is right now in terms of extensions
- Files are completely deleted from the system as opposed to moving them to trash / recycle bin



# Examples

### Dashboard

![Alt text](/samples/recently_modified.png?raw=true 'Dashboard')

### Markdown Editor

![Alt text](/samples/markdown_sample.png?raw=true 'Markdown')

### Image Cropper

![Alt text](/samples/image_cropper_sample.png?raw=true 'Image cropper')

### JSON Editor

![Alt text](/samples/json_sample.png?raw=true 'JSON Editor')

### Content search

![Alt text](/samples/search.png?raw=true 'Search')

### Search preferences

![Alt text](/samples/search_preferences.png?raw=true 'Search preferences')
