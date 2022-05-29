import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ErrorHandler,
} from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { of, Subscription } from 'rxjs';
import { tap, finalize, catchError } from 'rxjs/operators';
import { FilesService } from '../../services/files/files.service';
import { File } from '../../types/File';

@Component({
  selector: 'ngx-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
})
export class FileComponent implements OnDestroy {
  @Input() file: File;

  loading = false;
  subscriptions: Subscription[] = [];

  constructor(
    private readonly filesService: FilesService,
    private readonly cdr: ChangeDetectorRef,
    private readonly handleError: ErrorHandler,
    private readonly toastService: NbToastrService,
  ) {}

  downloadFile() {
    if (this.loading === true) {
      return;
    }

    this.loading = true;
    const sub = this.filesService
      .download(this.file.id)
      .pipe(
        tap((res) => {
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(res);
          a.href = objectUrl;
          a.download = this.file.name;
          a.click();
          URL.revokeObjectURL(objectUrl);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        catchError((err) => {
          this.toastService.show('Error while downloading file', 'Error', {
            status: 'danger',
          });
          this.handleError.handleError(err);
          return of(null);
        }),
      )
      .subscribe();

    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
