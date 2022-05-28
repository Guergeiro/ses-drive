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

@Component({
  selector: 'ngx-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss'],
})
export class FolderComponent implements OnInit {
  @Input() folder: Folder;
  @ViewChild(NbContextMenuDirective) contextMenu: NbContextMenuDirective;

  menu = [
    { title: 'Rename', icon: 'edit-outline' },
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
  ) {}

  ngOnInit(): void {
    this.nbMenuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag === `folder-submenu-${this.folder.id}`),
        map(({ item: { title } }) => title),
      )
      .subscribe((title) => {
        if (title === 'Rename') {
          // something
          return;
        }

        if (title === 'Delete') {
          this.deleteFolder();
        }
      });
  }

  changeDirectory(path: string) {
    this.newChangeDirectory.emit(path);
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
            tap((res) => {
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
}
