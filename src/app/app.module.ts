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
import { FolderNameDialogModule } from './components/dialogs/folder-name-dialog/folder-name-dialog/folder-name-dialog.module'
import { MatSnackBarModule } from '@angular/material/snack-bar'

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
    FolderNameDialogModule,
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
