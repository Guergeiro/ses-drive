import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ErrorHandler,
} from '@angular/core';
import { NbDialogService, NbMenuService } from '@nebular/theme';
import { filter, map, tap, finalize, catchError } from 'rxjs/operators';
import { DirectoriesService } from '../../services/directories/directories.service';
import { Subscription, of } from 'rxjs';
import { Directory } from '../../types/Directory';
import { AddFolderDialogComponent } from '../../components/dialogs/add-folder-dialog/add-folder-dialog.component';
import { AddFileDialogComponent } from '../../components/dialogs/add-file-dialog/add-file-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { FilesService } from '../../services/files/files.service';
import { File } from '../../types/File';

@Component({
  selector: 'ngx-my-drive',
  templateUrl: './my-drive.component.html',
  styleUrls: ['./my-drive.component.scss'],
})
export class MyDriveComponent implements OnInit, OnDestroy {
  items = [
    { title: 'File', icon: 'file-add' },
    { title: 'Folder', icon: 'folder-add' },
  ];

  breadcrumb = [];

  directory: Directory | Partial<Directory>;

  sharedFiles: File[];
  curPath: string;
  base: string;
  title: string;

  loading = false;
  subscriptions: Subscription[] = [];

  constructor(
    private readonly nbMenuService: NbMenuService,
    private readonly directoriesService: DirectoriesService,
    private readonly filesService: FilesService,
    private readonly cdr: ChangeDetectorRef,
    private readonly handleError: ErrorHandler,
    private readonly dialogService: NbDialogService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((params) => {
      this.base = params['base'];
      this.title = params['title'];

      if (this.base == null) {
        this.base = `/private/${sessionStorage.getItem('user_email')}`;
      }

      this.getDirectories();
    });

    const subs = this.nbMenuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'my-context-menu'),
        map(({ item: { title } }) => title),
      )
      .subscribe((title) => {
        if (title === 'File') {
          this.createFile();
          return;
        }

        if (title === 'Folder') {
          this.createFolder();
        }
      });

    this.subscriptions.push(subs);
  }

  getDirectories(path: string = this.base) {
    this.loading = true;
    const sub = this.directoriesService
      .getByPath(path)
      .pipe(
        tap((res) => {
          if (Array.isArray(res) && this.title === 'Shared') {
            this.directory = {
              fullpath: this.base,
              folders: res,
              files: [],
              viewers: [],
              editors: [],
            };
            res.fullpath = `/shared/${sessionStorage.getItem('user_email')}`;
            this.getSharedFiles();
          } else {
            this.directory = res;
          }
          this.curPath = res.fullpath;
          this.handleBreadcumb();
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
  }

  getSharedFiles() {
    this.loading = true;
    const sub = this.filesService
      .getSharedFiles()
      .pipe(
        tap((res) => {
          this.sharedFiles = res;
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
  }

  createFile() {
    this.dialogService
      .open(AddFileDialogComponent, {
        closeOnBackdropClick: false,
        context: {
          destination: this.curPath,
        },
      })
      .onClose.subscribe((success) => {
        if (success) {
          this.getDirectories(this.curPath);
          return;
        }
      });
  }

  createFolder() {
    this.dialogService
      .open(AddFolderDialogComponent, { closeOnBackdropClick: false })
      .onClose.subscribe((name) => {
        if (name == null || name === '') {
          return;
        }

        this.loading = true;
        const sub = this.directoriesService
          .create(name, this.curPath)
          .pipe(
            tap((res) => {
              this.getDirectories(this.curPath);
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

  serve() {
    const email = sessionStorage.getItem('user_email');

    window.open(`${environment.BASE_URL}/public/${email}`, '_blank');
  }

  handleBreadcumb() {
    const auxPath = this.curPath.split('/').slice(1);
    this.breadcrumb = [auxPath.slice(0, 2).join('/'), ...auxPath.slice(2)];
  }

  showButton() {
    const id = sessionStorage.getItem('user_id');

    if (this.directory?.editors?.includes(id) === false && this.base === '/') {
      return false;
    }

    return true;
  }

  getPath(index: number) {
    if (this.title === 'Shared' && index === 0) {
      return '/';
    }
    return '/' + this.breadcrumb.slice(0, index + 1).join('/');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
