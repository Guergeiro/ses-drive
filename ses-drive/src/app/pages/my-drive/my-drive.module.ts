import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyDriveComponent } from './my-drive.component';
import { MyDriveRoutingModule } from './my-drive-routing.module';
import {
  NbCardModule,
  NbIconModule,
  NbButtonModule,
  NbContextMenuModule,
  NbSpinnerModule,
} from '@nebular/theme';

@NgModule({
  imports: [
    CommonModule,
    MyDriveRoutingModule,
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbContextMenuModule,
    NbSpinnerModule,
  ],
  declarations: [MyDriveComponent],
})
export class MyDriveModule {}
