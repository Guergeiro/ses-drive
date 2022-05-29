import { Component, ErrorHandler, OnDestroy } from '@angular/core';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
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

  public files: File[] = [];

  loading = false;

  private subscriptions: Subscription[] = [];

  constructor(
    protected ref: NbDialogRef<AddFileDialogComponent>,
    private readonly filesService: FilesService,
    private readonly handleError: ErrorHandler,
    private readonly toastService: NbToastrService,
  ) {}

  public dropped(files: NgxFileDropEntry[]) {
    if (this.loading === true) {
      return;
    }

    if (this.files.length === 10 || files.length > 10) {
      this.toastService.show('Maximum 10 files.', 'Error', {
        status: 'danger',
      });
      return;
    }

    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          if (this.isFileSizeAllowed(file.size)) {
            this.files.push(file);
          } else {
            this.toastService.show('Maximum size accepted is 10MB.', 'Error', {
              status: 'danger',
            });
          }
        });
      }
    }
  }

  upload() {
    if (this.loading === true) {
      return;
    }

    this.loading = true;
    const sub = this.filesService
      .upload(this.destination, this.files)
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

  private isFileSizeAllowed(size: number) {
    return size < 10 * 1024 * 1024;
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
