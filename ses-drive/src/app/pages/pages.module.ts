import { NgModule } from '@angular/core';
import {
  NbMenuModule,
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbSpinnerModule,
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
  ],
  declarations: [
    PagesComponent,
    AddFileDialogComponent,
    AddFolderDialogComponent,
    YesOrNoDialogComponent,
    RenameDialogComponent,
  ],
  entryComponents: [
    AddFileDialogComponent,
    AddFolderDialogComponent,
    YesOrNoDialogComponent,
    RenameDialogComponent,
  ],
})
export class PagesModule {}
