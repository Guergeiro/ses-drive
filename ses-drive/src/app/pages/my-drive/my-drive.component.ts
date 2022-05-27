import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ErrorHandler,
} from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { filter, map, tap, finalize, catchError } from 'rxjs/operators';
import { DirectoriesService } from '../../services/directories/directories.service';
import { Subscription, of } from 'rxjs';
import { Directory } from '../../types/Directory';

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

  directory: Directory;
  curPath: string;

  loading = false;
  subscriptions: Subscription[] = [];

  constructor(
    private readonly nbMenuService: NbMenuService,
    private readonly directoriesService: DirectoriesService,
    private readonly cdr: ChangeDetectorRef,
    private readonly handleError: ErrorHandler,
  ) {}

  ngOnInit(): void {
    this.getDirectories();

    this.nbMenuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'my-context-menu'),
        map(({ item: { title } }) => title),
      )
      .subscribe((title) => alert(`${title} was clicked!`));
  }

  getDirectories(path?: string) {
    this.loading = true;
    const sub = this.directoriesService
      .getByPath(path)
      .pipe(
        tap((res) => {
          this.directory = res;
          this.curPath = res.fullpath;
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

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
