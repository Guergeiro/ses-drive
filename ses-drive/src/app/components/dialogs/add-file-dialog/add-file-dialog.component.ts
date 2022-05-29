import { Component, ErrorHandler, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { environment } from '../../../../environments/environment';
import { FilesService } from '../../../services/files/files.service';
import { Subscription, of, forkJoin } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

@Component({
  selector: 'ngx-add-file-dialog',
  templateUrl: './add-file-dialog.component.html',
  styleUrls: ['./add-file-dialog.component.scss'],
})
export class AddFileDialogComponent implements OnDestroy {
  URL = `${environment.API_URL_PREFIX}/files`;
  destination: string;

  public files: NgxFileDropEntry[] = [];
  uploadObjects = {};

  loading = false;

  private subscriptions: Subscription[] = [];

  constructor(
    protected ref: NbDialogRef<AddFileDialogComponent>,
    private readonly filesService: FilesService,
    private readonly handleError: ErrorHandler,
  ) {}

  public dropped(files: NgxFileDropEntry[]) {
    if (this.loading === true) {
      return;
    }

    this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.uploadObjects[file.name] = this.filesService.upload(
            this.destination,
            file,
          );
        });
      }
    }
  }

  upload() {
    if (this.loading === true) {
      return;
    }

    this.loading = true;
    const sub = forkJoin(this.uploadObjects)
      .pipe(
        tap((result) => {
          if (result) {
            this.ref.close(true);
          }
        }),
        finalize(() => {
          this.loading = false;
        }),
        catchError((err) => {
          this.handleError.handleError(err);
          this.ref.close();
          return of(null);
        }),
      )
      .subscribe();

    this.subscriptions.push(sub);
  }

  cancel() {
    if (this.loading === true) {
      return;
    }

    this.ref.close();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
