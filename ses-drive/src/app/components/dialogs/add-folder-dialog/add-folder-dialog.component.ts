import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-add-folder-dialog',
  templateUrl: './add-folder-dialog.component.html',
  styleUrls: ['./add-folder-dialog.component.scss'],
})
export class AddFolderDialogComponent {
  constructor(protected ref: NbDialogRef<AddFolderDialogComponent>) {}

  submit(name: string) {
    this.ref.close(name);
  }

  cancel() {
    this.ref.close();
  }
}
