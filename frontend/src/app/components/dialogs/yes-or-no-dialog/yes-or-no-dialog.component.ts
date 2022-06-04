import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-yes-or-no-dialog',
  templateUrl: './yes-or-no-dialog.component.html',
  styleUrls: ['./yes-or-no-dialog.component.scss'],
})
export class YesOrNoDialogComponent {
  title: string;
  description: string;

  constructor(protected ref: NbDialogRef<YesOrNoDialogComponent>) {}

  submit(accept: boolean) {
    this.ref.close(accept);
  }
}
