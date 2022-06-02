import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ErrorHandler,
  EventEmitter,
  Output,
  HostListener,
} from '@angular/core';
import {
  NbContextMenuDirective,
  NbToastrService,
  NbMenuService,
  NbDialogService,
} from '@nebular/theme';
import { of, Subscription } from 'rxjs';
import { tap, finalize, catchError, filter, map } from 'rxjs/operators';
import { FilesService } from '../../services/files/files.service';
import { File } from '../../types/File';
import { ViewChild } from '@angular/core';
import { RenameDialogComponent } from '../dialogs/rename-dialog/rename-dialog.component';
import { YesOrNoDialogComponent } from '../dialogs/yes-or-no-dialog/yes-or-no-dialog.component';

@Component({
  selector: 'ngx-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
})
export class FileComponent implements OnInit, OnDestroy {
  @Input() file: File;
  @ViewChild(NbContextMenuDirective) contextMenu: NbContextMenuDirective;

  menu = [
    { title: 'Rename', icon: 'edit-outline' },
    { title: 'Delete', icon: 'trash-outline' },
  ];

  @Output() newRefreshParent = new EventEmitter<string>();

  loading = false;
  subscriptions: Subscription[] = [];

  constructor(
    private readonly filesService: FilesService,
    private readonly nbMenuService: NbMenuService,
    private readonly cdr: ChangeDetectorRef,
    private readonly handleError: ErrorHandler,
    private readonly dialogService: NbDialogService,
    private readonly toastService: NbToastrService,
  ) {}

  ngOnInit(): void {
    const subs = this.nbMenuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag === `file-submenu-${this.file.id}`),
        map(({ item: { title } }) => title),
      )
      .subscribe((title) => {
        if (title === 'Rename') {
          this.rename();
          return;
        }

        if (title === 'Delete') {
          this.delete();
        }
      });

    this.subscriptions.push(subs);
  }

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

  rename() {
    this.dialogService
      .open(RenameDialogComponent, {
        closeOnBackdropClick: false,
        context: {
          title: 'Rename File',
          currentName: this.file.name,
        },
      })
      .onClose.subscribe((name) => {
        if (name == null || name === '') {
          return;
        }

        this.loading = true;
        const sub = this.filesService
          .rename(this.file.id, name)
          .pipe(
            tap((res) => {
              this.newRefreshParent.emit(
                this.buildParentPath(this.file.fullpath),
              );
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck();
            }),
            catchError((err) => {
              this.handleError.handleError(err);
              return of(null);
            }),
          )
          .subscribe();

        this.subscriptions.push(sub);
      });
  }

  delete() {
    this.dialogService
      .open(YesOrNoDialogComponent, {
        closeOnBackdropClick: false,
        context: {
          title: 'Delete File',
          description: `Are you sure you want to delete ${this.file.name}?`,
        },
      })
      .onClose.subscribe((accept) => {
        if (accept === false) {
          return;
        }

        this.loading = true;
        const sub = this.filesService
          .delete(this.file.id)
          .pipe(
            tap((res) => {
              this.newRefreshParent.emit(
                this.buildParentPath(this.file.fullpath),
              );
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck();
            }),
            catchError((err) => {
              this.handleError.handleError(err);
              return of(null);
            }),
          )
          .subscribe();

        this.subscriptions.push(sub);
      });
  }

  open() {
    this.contextMenu.show();
    return false;
  }

  @HostListener('document:click')
  close() {
    this.contextMenu.hide();
  }

  private buildParentPath(path: string) {
    const auxPath = path.split('/');

    if (auxPath.length >= 3) {
      auxPath.pop();
    }

    return auxPath.join('/');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
