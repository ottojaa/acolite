import { Component, OnInit } from '@angular/core'
import { ElectronService } from 'app/core/services'
import { AutoUpdateEvents } from '../../../../../app/shared/actions'

@Component({
  selector: 'app-auto-updater',
  templateUrl: './auto-updater.component.html',
  styleUrls: ['./auto-updater.component.scss'],
})
export class AutoUpdaterComponent implements OnInit {
  statusText: string
  downloadProgress: number

  showLoader = false
  showProgressBar = false
  updateDownloaded = false

  constructor(public electronService: ElectronService) {
    this.electronService.startAutoUpdater()
  }

  ngOnInit(): void {
    this.startUpdateListeners()
  }

  startUpdateListeners(): void {
    const channels = [
      AutoUpdateEvents.UpdateAvailable,
      AutoUpdateEvents.UpdateNotAvailable,
      AutoUpdateEvents.CheckingForUpdates,
      AutoUpdateEvents.DownloadProgress,
      AutoUpdateEvents.UpdateDownloaded,
    ]

    channels.forEach((channel) => {
      this.eventReducer(channel)
    })
  }

  eventReducer(action: AutoUpdateEvents): void {
    this.electronService.on(action, (_event, response?: number) => {
      this.showLoader = true

      switch (action) {
        case AutoUpdateEvents.UpdateAvailable: {
          this.statusText = 'Update available'
          break
        }
        case AutoUpdateEvents.UpdateNotAvailable: {
          this.showLoader = false
          break
        }
        case AutoUpdateEvents.CheckingForUpdates: {
          this.statusText = 'Checking for updates...'
          break
        }
        case AutoUpdateEvents.DownloadProgress: {
          this.showProgressBar = true
          this.statusText = 'Downloading update'
          this.downloadProgress = response
          break
        }
        case AutoUpdateEvents.UpdateDownloaded: {
          this.showProgressBar = false
          this.updateDownloaded = true
          this.statusText = 'Update downloaded'
          break
        }
      }
    })
  }
}
