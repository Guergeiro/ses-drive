import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  HostListener,
  ErrorHandler,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  NbContextMenuDirective,
  NbMenuService,
  NbDialogService,
} from '@nebular/theme';
import { filter, finalize, map, tap, catchError } from 'rxjs/operators';
import { DirectoriesService } from '../../services/directories/directories.service';
import { Folder } from '../../types/Folder';
import { Subscription, of } from 'rxjs';
import { YesOrNoDialogComponent } from '../dialogs/yes-or-no-dialog/yes-or-no-dialog.component';
import { RenameDialogComponent } from '../dialogs/rename-dialog/rename-dialog.component';
import { ShareDialogComponent } from '../dialogs/share-dialog/share-dialog.component';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss'],
})
export class FolderComponent implements OnInit, OnDestroy {
  @Input() folder: Folder;
  @ViewChild(NbContextMenuDirective) contextMenu: NbContextMenuDirective;

  menu = [
    { title: 'Rename', icon: 'edit-outline' },
    { title: 'Share', icon: 'share-outline' },
    { title: 'Delete', icon: 'trash-outline' },
  ];

  @Output() newChangeDirectory = new EventEmitter<string>();

  loading = false;
  subscriptions: Subscription[] = [];

  constructor(
    private readonly directoriesService: DirectoriesService,
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
        filter(({ tag }) => tag === `folder-submenu-${this.folder.id}`),
        map(({ item: { title } }) => title),
      )
      .subscribe((title) => {
        if (title === 'Rename') {
          this.renameFolder();
          return;
        }

        if (title === 'Share') {
          this.share();
          return;
        }

        if (title === 'Delete') {
          this.deleteFolder();
        }
      });

    this.subscriptions.push(subs);
  }

  changeDirectory(path: string) {
    this.newChangeDirectory.emit(path);
  }

  renameFolder() {
    this.dialogService
      .open(RenameDialogComponent, {
        closeOnBackdropClick: false,
        context: {
          title: 'Rename Folder',
          currentName: this.folder.name,
        },
      })
      .onClose.subscribe((name) => {
        if (name == null || name === '') {
          return;
        }

        this.loading = true;
        const sub = this.directoriesService
          .rename(this.folder.id, name)
          .pipe(
            tap(() => {
              this.newChangeDirectory.emit(
                this.buildParentPath(this.folder.fullpath),
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

  deleteFolder() {
    this.dialogService
      .open(YesOrNoDialogComponent, {
        closeOnBackdropClick: false,
        context: {
          title: 'Delete Folder',
          description: `Are you sure you want to delete ${this.folder.name} folder?`,
        },
      })
      .onClose.subscribe((accept) => {
        if (accept === false) {
          return;
        }

        this.loading = true;
        const sub = this.directoriesService
          .delete(this.folder.id)
          .pipe(
            tap(() => {
              this.newChangeDirectory.emit(
                this.buildParentPath(this.folder.fullpath),
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

  share() {
    this.dialogService
      .open(ShareDialogComponent, {
        closeOnBackdropClick: false,
        context: {
          title: 'Share Folder',
          current: this.folder.name,
        },
      })
      .onClose.subscribe((res) => {
        if (res == null) {
          return;
        }

        this.loading = true;
        const sub = this.directoriesService
          .share(this.folder.id, res.permission, res.email)
          .pipe(
            tap(() => {
              this.newChangeDirectory.emit(
                this.buildParentPath(this.folder.fullpath),
              );

              this.toastService.show(
                `You changed the permissions with success!`,
                'Success',
                {
                  status: 'success',
                },
              );
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck();
            }),
            catchError((err) => {
              this.toastService.show(
                'Error while sharing, try again later.',
                'Error',
                {
                  status: 'danger',
                },
              );
              this.handleError.handleError(err);
              return of(null);
            }),
          )
          .subscribe();
        this.subscriptions.push(sub);
      });
  }

  open() {
    const id = sessionStorage.getItem('user_id');
    if (!this.folder.editors.includes(id) && this.folder.owner !== id) {
      return false;
    }
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
