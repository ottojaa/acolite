import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor() {}

  getLanguage(): any {
    return 'en-GB'
  }

  getStoreData(): any {}
}
