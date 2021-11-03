import { BrowserModule } from '@angular/platform-browser'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
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

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/', '.json')

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
    FolderCreationDialogModule,
    RenameFileDialogModule,
    DeleteFilesDialogModule,
    MoveFilesDialogModule,
    MatSnackBarModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [AppDialogService, MatDialog],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
