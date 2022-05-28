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

  directory: Directory;
  curPath: string;

  loading = false;
  subscriptions: Subscription[] = [];

  constructor(
    private readonly nbMenuService: NbMenuService,
    private readonly directoriesService: DirectoriesService,
    private readonly cdr: ChangeDetectorRef,
    private readonly handleError: ErrorHandler,
    private readonly dialogService: NbDialogService,
  ) {}

  ngOnInit(): void {
    this.getDirectories();

    this.nbMenuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'my-context-menu'),
        map(({ item: { title } }) => title),
      )
      .subscribe((title) => {
        if (title === 'File') {
          // something
          return;
        }

        if (title === 'Folder') {
          this.createFolder();
        }
      });
  }

  getDirectories(path?: string) {
    this.loading = true;
    const sub = this.directoriesService
      .getByPath(path)
      .pipe(
        tap((res) => {
          this.directory = res;
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

  createFolder() {
    this.dialogService
      .open(AddFolderDialogComponent)
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

  handleBreadcumb() {
    const auxPath = this.curPath.split('/').slice(1);
    this.breadcrumb = [auxPath.slice(0, 2).join('/'), ...auxPath.slice(2)];
  }

  getPath(index: number) {
    return '/' + this.breadcrumb.slice(0, index + 1).join('/');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
