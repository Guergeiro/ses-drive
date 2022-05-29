import {
  ChangeDetectorRef,
  Component,
  ErrorHandler,
  OnInit,
} from '@angular/core';
import { User } from '../../types/User';
import { Subscription, of } from 'rxjs';
import { MeService } from '../../services/me/me.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User;

  loading = false;

  subscriptions: Subscription[] = [];

  constructor(
    private readonly meService: MeService,
    private readonly handleError: ErrorHandler,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastService: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.loading = true;
    const sub = this.meService
      .me()
      .pipe(
        tap((res) => {
          this.user = res;
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

  refreshApiKey() {
    this.loading = true;
    const sub = this.meService
      .refreshApiKey()
      .pipe(
        tap(() => {
          this.getUser();
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

  copyAddr(key: string) {
    this.showToast('API key was copied to your clipboard!', 'Success');

    navigator.clipboard.writeText(key).then(
      function () {},
      function (err) {
        this.showToast('Apy key was not copied to your clipboard!', 'Danger');
        console.error('Async: Could not copy text: ', err);
      },
    );
  }

  showToast(message: string, type: string) {
    this.toastService.show(message, type, {
      status: type.toLowerCase(),
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
