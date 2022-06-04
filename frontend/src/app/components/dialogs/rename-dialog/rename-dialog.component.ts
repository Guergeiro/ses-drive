import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.scss'],
})
export class RenameDialogComponent {
  title: string;
  currentName: string;

  constructor(protected ref: NbDialogRef<RenameDialogComponent>) {}

  submit(name: string) {
    this.ref.close(name);
  }

  cancel() {
    this.ref.close();
  }
}
