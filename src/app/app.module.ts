import { BrowserModule, DomSanitizer } from '@angular/platform-browser'
import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule, HttpClient } from '@angular/common/http'
import { CoreModule } from './core/core.module'
import { SharedModule } from './shared/shared.module'

import { AppRoutingModule } from './app-routing.module'

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

import { HomeModule } from './home/base-directory.module'
import { DetailModule } from './main/main.module'

import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AppDialogService } from './services/dialog.service'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { BaseDirectoryDialogModule } from './components/dialogs/base-directory-dialog/base-directory-dialog.module'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { FolderCreationDialogModule } from './components/dialogs/folder-creation-dialog/folder-name-dialog/folder-creation-dialog.module'
import { RenameFileDialogModule } from './components/dialogs/rename-file-dialog/rename-file-dialog.module'
import { DeleteFilesDialogModule } from './components/dialogs/delete-files-dialog/delete-files-dialog.module'
import { MoveFilesDialogModule } from './components/dialogs/move-files-dialog/move-files-dialog.module'
import { ChangeDirectoryDialogModule } from './components/dialogs/change-directory-dialog/change-directory-dialog.module'
import { SettingsService } from './services/settings.service'
import '@angular/common/locales/global/en-GB'
import { SearchBuilderDialogModule } from './components/dialogs/search-builder-dialog/search-builder-dialog.module'
import { MatIconRegistry } from '@angular/material/icon'
import { FormatDistancePipe } from './components/pipes/format-distance.pipe'
import { ConfirmDialogModule } from './components/dialogs/confirm-dialog/confirm-dialog.module'

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/', '.json')

/**
 * Contains typings for the functions exposed to the renderer process via contextBridge
 */

export interface IIpcAPI {
  on: (channel: string, data: any) => void
  send: (channel: string, data: any) => void
  invoke: (channel: string, data: any) => void
}

export interface IHighlightAPI {
  highlightAuto: (code: string) => string
}

export interface IPathAPI {
  getBaseName: (filePath: string) => string
  getExtension: (filePath: string) => string
  getJoinedPath: (filePaths: string[]) => string
  getDirName: (filePath: string) => string
  getPathSeparator: () => string
}

declare global {
  interface Window {
    highlightJS: IHighlightAPI
    path: IPathAPI
    ipc: IIpcAPI
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    HomeModule,
    DetailModule,
    AppRoutingModule,
    MatDialogModule,
    ReactiveFormsModule,
    BaseDirectoryDialogModule,
    ChangeDirectoryDialogModule,
    FolderCreationDialogModule,
    BrowserAnimationsModule,
    RenameFileDialogModule,
    DeleteFilesDialogModule,
    MoveFilesDialogModule,
    SearchBuilderDialogModule,
    ConfirmDialogModule,
    MatSnackBarModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    AppDialogService,
    FormatDistancePipe,
    MatDialog,
    {
      provide: LOCALE_ID,
      deps: [SettingsService],
      useFactory: (settingsService: SettingsService) => settingsService.getLanguage(),
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(iconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    iconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'))
    iconRegistry.addSvgIcon(
      'css',
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/file-extension-icons/css.svg')
    )
    iconRegistry.addSvgIcon(
      'scss',
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/file-extension-icons/scss.svg')
    )
    iconRegistry.addSvgIcon(
      'image',
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/file-extension-icons/image.svg')
    )
    iconRegistry.addSvgIcon(
      'html',
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/file-extension-icons/html.svg')
    )
    iconRegistry.addSvgIcon(
      'default-document',
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/file-extension-icons/document.svg')
    )
    iconRegistry.addSvgIcon(
      'typescript',
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/file-extension-icons/typescript.svg')
    )
  }
}
