import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss'],
})
export class ShareDialogComponent {
  title: string;
  current: string;

  permissions = [
    { value: 'view', name: 'View' },
    { value: 'edit', name: 'View + Edit' },
    { value: 'revoke', name: 'Revoke' },
  ];

  constructor(protected ref: NbDialogRef<ShareDialogComponent>) {}

  submit(email: string, permission: string) {
    if (
      email === '' ||
      email == null ||
      permission === '' ||
      permission == null
    ) {
      return;
    }

    this.ref.close({ email, permission });
  }

  cancel() {
    this.ref.close();
  }
}
