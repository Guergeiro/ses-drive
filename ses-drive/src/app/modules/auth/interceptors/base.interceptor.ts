import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable()
export class BaseInterceptor implements HttpInterceptor {
  private readonly API_URL_PREFIX = environment.API_URL_PREFIX;

  public intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    if (
      request.url.startsWith('http') === true ||
      request.url.startsWith('https') === true
    ) {
      return next.handle(request);
    }

    request = request.clone({
      url: `${this.API_URL_PREFIX}/${request.url}`,
    });

    return next.handle(request);
  }
}
