import { NgModule } from '@angular/core';
import {
  NbMenuModule,
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbSpinnerModule,
  NbFormFieldModule,
  NbIconModule,
  NbSelectModule,
} from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { ECommerceModule } from './e-commerce/e-commerce.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { AddFolderDialogComponent } from '../components/dialogs/add-folder-dialog/add-folder-dialog.component';
import { YesOrNoDialogComponent } from '../components/dialogs/yes-or-no-dialog/yes-or-no-dialog.component';
import { RenameDialogComponent } from '../components/dialogs/rename-dialog/rename-dialog.component';
import { AddFileDialogComponent } from '../components/dialogs/add-file-dialog/add-file-dialog.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { ProfileComponent } from './profile/profile.component';
import { ShareDialogComponent } from '../components/dialogs/share-dialog/share-dialog.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    DashboardModule,
    ECommerceModule,
    MiscellaneousModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NgxFileDropModule,
    NbSpinnerModule,
    NbFormFieldModule,
    NbIconModule,
    NbSelectModule,
    NgxCaptchaModule,
    FormsModule,
  ],
  declarations: [
    PagesComponent,
    AddFileDialogComponent,
    AddFolderDialogComponent,
    YesOrNoDialogComponent,
    RenameDialogComponent,
    ProfileComponent,
    ShareDialogComponent,
  ],
  entryComponents: [
    AddFileDialogComponent,
    AddFolderDialogComponent,
    YesOrNoDialogComponent,
    RenameDialogComponent,
    ShareDialogComponent,
  ],
})
export class PagesModule {}
