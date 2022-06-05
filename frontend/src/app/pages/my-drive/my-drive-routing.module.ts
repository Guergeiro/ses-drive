import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyDriveComponent } from './my-drive.component';

const routes: Routes = [
  {
    path: '',
    component: MyDriveComponent,
    data: {
      title: 'Private',
    },
  },
  {
    path: 'public',
    component: MyDriveComponent,
    data: {
      base: '/public',
      title: 'Public',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyDriveRoutingModule {}
