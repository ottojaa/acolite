import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { blacklistZone } from 'app/services/event-blacklist'

import { AppModule } from './app/app.module'
import { APP_CONFIG } from './environments/environment'

if (APP_CONFIG.production) {
  enableProdMode()
}

blacklistZone.run(() => {
  platformBrowserDynamic()
    .bootstrapModule(AppModule, {
      preserveWhitespaces: false,
    })
    .catch((err) => console.error(err))
})
