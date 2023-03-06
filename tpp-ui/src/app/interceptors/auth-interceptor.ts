/*
 * Copyright 2018-2022 adorsys GmbH & Co KG
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at
 * your option) any later version. This program is distributed in the hope that
 * it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 *
 * This project is also available under a separate commercial license. You can
 * contact us at psd2@adorsys.com.
 */

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  private authTokenStorageKey = 'access_token';

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return fromPromise(this.handleRequest(request, next)).pipe(
      tap((event: HttpEvent<any>) => {
        if (
          event instanceof HttpResponse &&
          event.headers.has(this.authTokenStorageKey)
        ) {
          this.saveAccessToken(event.headers.get(this.authTokenStorageKey));
        }
      }),
      catchError((errors) => {
        if (errors instanceof HttpErrorResponse) {
          if (errors.status === 401 && this.authService.isLoggedIn()) {
            this.authService.logout();
          }
        }
        return observableThrowError(errors);
      })
    );
  }

  private async handleRequest(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Promise<HttpEvent<any>> {
    if (this.authService.isLoggedIn()) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.authService.getAuthorizationToken(),
        },
      });
    }
    return next.handle(request).toPromise();
  }

  private saveAccessToken(jwt: string) {
    if (jwt !== undefined) {
      sessionStorage.setItem(this.authTokenStorageKey, jwt);
    }
  }
}
