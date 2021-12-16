import { MenuItemConstructorOptions } from 'electron'

const isMac = process.platform === 'darwin'

export const getEditorMenuItems = (): MenuItemConstructorOptions[] => {
  const baseItems: MenuItemConstructorOptions[] = [
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
  ]

  const macItems: MenuItemConstructorOptions[] = [
    { role: 'pasteAndMatchStyle' },
    { role: 'delete' },
    { role: 'selectAll' },
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
    },
  ]

  const windowsItems: MenuItemConstructorOptions[] = [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]

  return isMac ? [...baseItems, ...macItems] : [...baseItems, ...windowsItems]
}
