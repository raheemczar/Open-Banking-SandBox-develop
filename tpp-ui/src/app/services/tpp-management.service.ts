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

import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginationResponse } from '../models/pagination-reponse';
import { map } from 'rxjs/operators';
import { User, UserResponse } from '../models/user.model';
import { TppQueryParams, TppResponse } from '../models/tpp-management.model';
import { AccountResponse } from '../models/account.model';
import { GrantAccountAccess } from '../models/grant-account-access.model';

@Injectable({
  providedIn: 'root',
})
export class TppManagementService {
  public url = `${environment.tppBackend}`;
  private staffRole = 'STAFF';
  private customerRole = 'CUSTOMER';

  constructor(private http: HttpClient) {}

  changePin(tppId: string, newPin: string) {
    return this.http.put(
      `${this.url}/admin/password?tppId=${tppId}&pin=${newPin}`,
      null
    );
  }

  blockUser(userId: string) {
    return this.http.post(`${this.url}/admin/status?userId=${userId}`, userId);
  }

  blockAccount(accountId: string) {
    return this.http.post(
      `${this.url}/accounts/status?accountId=${accountId}`,
      accountId
    );
  }

  deleteTpp(tppId: string) {
    return this.http.delete(`${this.url}/admin?tppId=${tppId}`);
  }

  deleteUser(userId: string) {
    return this.http.delete(`${this.url}/user/${userId}`);
  }

  deleteAccount(accountId: string) {
    return this.http.delete(this.url + `/account/${accountId}`);
  }

  updateUserDetails(user: User, tppId: string): Observable<any> {
    return this.http.put(this.url + `/admin/users?tppId=${tppId}`, user);
  }

  createUser(user: User, tppId: string): Observable<any> {
    return this.http.post(this.url + `/admin/register?tppId=${tppId}`, user);
  }

  createAdmin(user: User): Observable<any> {
    return this.http.post(this.url + `/admin/register/admin`, user);
  }

  deleteSelf() {
    return this.http.delete(this.url + '/self');
  }

  deleteTestData() {
    return this.http.delete(this.url + '/admin/test/data');
  }

  deleteAccountTransactions(accountId: string) {
    return this.http.delete(this.url + '/transactions/' + accountId);
  }

  updateAccountAccessForUser(accountAccess: GrantAccountAccess) {
    return this.http.put(this.url + '/accounts/access', accountAccess);
  }

  getUsersForTpp(tppId: string): Observable<User[]> {
    return this.getAllUsers(0, 100, { tppId: tppId }).pipe(
      map((resp) => {
        return resp.users;
      })
    );
  }

  getTppById(tppId: string): Observable<User> {
    return this.getTpps(0, 1, { tppId: tppId }).pipe(
      map((data) => {
        if (data && data.tpps && data.tpps.length > 0) {
          return data.tpps[0];
        } else {
          return undefined;
        }
      })
    );
  }

  getTpps(
    page: number,
    size: number,
    queryParams?: TppQueryParams
  ): Observable<TppResponse> {
    return this.getData(page, size, this.staffRole, false, queryParams).pipe(
      map((resp) => {
        return {
          tpps: resp.content,
          totalElements: resp.totalElements,
        };
      })
    );
  }

  getAllUsers(
    page: number,
    size: number,
    queryParams?: TppQueryParams
  ): Observable<UserResponse> {
    return this.getData(page, size, this.customerRole, false, queryParams).pipe(
      map((resp) => {
        return {
          users: resp.content,
          totalElements: resp.totalElements,
        };
      })
    );
  }

  getAllAccounts(
    page: number,
    size: number,
    queryParams?: TppQueryParams
  ): Observable<AccountResponse> {
    return this.getData(page, size, this.customerRole, true, queryParams).pipe(
      map((resp) => {
        return {
          accounts: resp.content,
          totalElements: resp.totalElements,
        };
      })
    );
  }

  private getData(
    page: number,
    size: number,
    role: string,
    accounts: boolean,
    queryParams?: TppQueryParams
  ): Observable<any> {
    let params = new HttpParams();
    params = params.set('page', page.toLocaleString());
    params = params.set('size', size.toLocaleString());
    params = params.set('role', role);

    if (queryParams) {
      if (queryParams.userLogin) {
        params = params.set('userLogin', queryParams.userLogin);
      }
      if (queryParams.tppId) {
        params = params.set('tppId', queryParams.tppId);
      }
      if (queryParams.ibanParam) {
        params = params.set('ibanParam', queryParams.ibanParam);
      }
      if (queryParams.country) {
        params = params.set('country', queryParams.country);
      }
      if (queryParams.tppLogin) {
        params = params.set('tppLogin', queryParams.tppLogin);
      }
      if (queryParams.blocked) {
        params = params.set('blocked', JSON.stringify(queryParams.blocked));
      }
      if (queryParams.blocked === false) {
        params = params.set('blocked', JSON.stringify(queryParams.blocked));
      }
    }

    const endpoint = accounts ? 'account' : 'users';
    return this.http.get<PaginationResponse<User[]>>(
      `${this.url}/admin/${endpoint}`,
      { params: params }
    );
  }

  getAdminById(id, size): Observable<any> {
    return this.getAllAdmins(0, size).pipe(
      map((data) => {
        if (data.users) {
          return data.users.find((u) => u.id === id);
        }
        return undefined;
      })
    );
  }

  getAllAdmins(number: number, size: number) {
    let params = new HttpParams();
    params = params.set('page', number.toLocaleString());
    params = params.set('size', size.toLocaleString());
    return this.http
      .get<PaginationResponse<User[]>>(`${this.url}/admin/admins`, {
        params: params,
      })
      .pipe(
        map((resp) => {
          return {
            users: resp.content,
            totalElements: resp.totalElements,
          };
        })
      );
  }
}
