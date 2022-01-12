import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { ProgressInfo } from 'electron-updater'
import { AutoUpdateEvent } from '../../../../../app/shared/actions'

interface DownloaderState {
  statusText: string
  status: 'available' | 'checking' | 'downloading' | 'not-available' | 'downloaded' | undefined
  showLoader: boolean
  downloadProgress: number | undefined
}

@Component({
  selector: 'app-auto-updater',
  templateUrl: './auto-updater.component.html',
  styleUrls: ['./auto-updater.component.scss'],
})
export class AutoUpdaterComponent implements OnInit {
  downloaderState: DownloaderState = {
    statusText: '',
    status: undefined,
    showLoader: false,
    downloadProgress: undefined,
  }

  constructor(public electronService: ElectronService, public cdRef: ChangeDetectorRef) {
    this.electronService.startAutoUpdater()
  }

  ngOnInit(): void {
    this.startUpdateListeners()
  }

  startUpdateListeners(): void {
    const channels = [
      AutoUpdateEvent.UpdateAvailable,
      AutoUpdateEvent.UpdateNotAvailable,
      AutoUpdateEvent.CheckingForUpdates,
      AutoUpdateEvent.DownloadProgress,
      AutoUpdateEvent.UpdateDownloaded,
    ]

    channels.forEach((channel) => {
      this.eventReducer(channel)
    })
  }

  eventReducer(action: AutoUpdateEvent): void {
    this.electronService.on(action, (_event, response?: ProgressInfo) => {
      if (action === AutoUpdateEvent.UpdateNotAvailable) {
        this.updateDownloaderState({ showLoader: false })
        return
      } else {
        this.updateDownloaderState({ showLoader: true })
      }

      switch (action) {
        case AutoUpdateEvent.UpdateAvailable: {
          this.updateDownloaderState({ statusText: 'Update available', status: 'available' })
          break
        }
        case AutoUpdateEvent.CheckingForUpdates: {
          this.updateDownloaderState({ statusText: 'Checking for updates...', status: 'checking' })
          break
        }
        case AutoUpdateEvent.DownloadProgress: {
          this.updateDownloaderState({
            statusText: 'Downloading update',
            status: 'downloading',
            downloadProgress: response.percent,
          })
          break
        }
        case AutoUpdateEvent.UpdateDownloaded: {
          this.updateDownloaderState({
            statusText: 'Update downloaded',
            status: 'downloaded',
          })
          break
        }
      }
    })
  }

  updateDownloaderState(state: Partial<DownloaderState>): void {
    this.downloaderState = { ...this.downloaderState, ...state }
    this.cdRef.detectChanges()
  }

  quitAndInstall(): void {
    this.electronService.quitAndInstall()
  }

  downloadUpdate(): void {
    this.electronService.downloadUpdate()
  }
}
