import { Inject, Injectable, Injector } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, finalize, switchMap, filter } from 'rxjs/operators';
import {
  nbAuthCreateToken,
  NbAuthSimpleToken,
  NbAuthToken,
  NbTokenService,
} from '@nebular/auth';
import { NbAuthService } from '@nebular/auth';
import { NB_AUTH_TOKEN_INTERCEPTOR_FILTER } from '@nebular/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  blocksRequests: BehaviorSubject<boolean>;
  blocksRequests$: Observable<boolean>;

  constructor(
    private injector: Injector,
    private tokenService: NbTokenService,
    @Inject(NB_AUTH_TOKEN_INTERCEPTOR_FILTER) protected filterInterceptor,
  ) {
    this.blocksRequests = new BehaviorSubject<boolean>(false);
    this.blocksRequests$ = this.blocksRequests.asObservable();
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // do not intercept request whose urls are filtered by the injected filter
    if (!this.filterInterceptor(req)) {
      return this.authService.isAuthenticatedOrRefresh().pipe(
        switchMap((authenticated) => {
          if (authenticated) {
            return this.authService.getToken().pipe(
              switchMap((token: NbAuthToken) => {
                const JWT = `Bearer ${token.getValue()}`;

                if (req.url.includes('/api/v0/auth/sign-out')) {
                  req = req.clone({
                    body: {},
                    headers: new HttpHeaders().set(
                      'Content-Type',
                      'application/json',
                    ),
                    responseType: 'json',
                    withCredentials: true,
                  });
                } else {
                  req = req.clone({
                    setHeaders: {
                      Authorization: JWT,
                    },
                  });
                }

                return next.handle(req);
              }),

              catchError((error) => {
                if (error.status !== 401) {
                  return throwError(error);
                }

                if (req.url.includes('api/auth/sign-in')) {
                  return throwError(error);
                }
                return throwError(error);
              }),
            );
          } else {
            if (req.url.includes('/api/v0/auth/sign-in')) {
              req = req.clone({
                withCredentials: true,
              });
            }
            // Request is sent to server without authentication so that the client code
            // receives the 401/403 error and can act as desired ('session expired', redirect to login, aso)
            return next.handle(req);
          }
        }),
      );
    } else {
      return next.handle(req);
    }
  }

  protected get authService(): NbAuthService {
    return this.injector.get(NbAuthService);
  }

  private refreshAccessTokenAndDoRequestAgain(
    request: HttpRequest<any>,
    next: HttpHandler,
  ) {
    if (this.blocksRequests.value === true) {
      return this.blocksRequests$.pipe(
        filter((blocked) => blocked === false),
        switchMap(() => {
          const authData = JSON.parse(localStorage.getItem('auth_app_token'));

          return this.doRequestAgainWithNewCredentials(
            request,
            authData.value,
            next,
          );
        }),
      );
    }

    this.blocksRequests.next(true);
    this.tokenService.clear().subscribe();

    const requestRefreshToken = new HttpRequest(
      'GET',
      `http://localhost:3000/api/v0/auth/refresh`,
      { withCredentials: true },
    );

    return next.handle(requestRefreshToken).pipe(
      switchMap((event: HttpEvent<{ accessToken: string }>) => {
        if (event instanceof HttpResponse) {
          const { body } = event;

          // Alterar o access-token
          if (body?.accessToken) {
            const token = nbAuthCreateToken(
              NbAuthSimpleToken,
              body.accessToken,
              'email',
            );

            this.tokenService.set(token).subscribe();

            return this.doRequestAgainWithNewCredentials(
              request,
              body.accessToken,
              next,
            );
          } else {
            throw new Error('Access Token not provided');
          }
        } else {
          return of(event);
        }
      }),

      finalize(() => {
        this.blocksRequests.next(false);
      }),

      catchError((error) => {
        return throwError(error);
      }),
    );
  }

  private doRequestAgainWithNewCredentials(
    request: HttpRequest<unknown>,
    accessToken: string,
    next: HttpHandler,
  ) {
    const clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return next.handle(clonedRequest).pipe(
      catchError((error) => {
        return throwError(error);
      }),
    );
  }
}
