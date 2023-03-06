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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { IconModule } from '../../commons/icon/icon.module';
import { InfoModule } from '../../commons/info/info.module';
import { InfoService } from '../../commons/info/info.service';
import {
  Account,
  AccountStatus,
  AccountType,
  UsageType,
} from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { AccountListComponent } from './account-list.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { PaginationContainerComponent } from '../../commons/pagination-container/pagination-container.component';
import { PaginationConfigModel } from '../../models/pagination-config.model';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;
  let accountService: AccountService;
  let infoService: InfoService;
  let router: Router;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule,
          ReactiveFormsModule,
          HttpClientTestingModule,
          InfoModule,
          RouterTestingModule,
          FilterPipeModule,
          IconModule,
          NgbPaginationModule,
          FormsModule,
        ],
        declarations: [AccountListComponent, PaginationContainerComponent],
        providers: [AccountService, InfoService],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    infoService = TestBed.get(InfoService);
    router = TestBed.get(Router);
    fixture.detectChanges();
    accountService = TestBed.get(AccountService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on NgOnInit', () => {
    let mockAccounts: Account[] = [
      {
        id: 'XXXXXX',
        iban: 'DE35653635635663',
        bban: 'BBBAN',
        pan: 'pan',
        maskedPan: 'maskedPan',
        currency: 'EUR',
        msisdn: 'MSISDN',
        name: 'Pupkin',
        product: 'Deposit',
        accountType: AccountType.CASH,
        accountStatus: AccountStatus.ENABLED,
        bic: 'BIChgdgd',
        usageType: UsageType.PRIV,
        details: '',
        linkedAccounts: '',
        balances: [],
      } as Account,
    ];
    let getAccountsSpy = spyOn(accountService, 'getAccounts').and.returnValue(
      of({
        accounts: mockAccounts,
        totalElements: mockAccounts.length,
      })
    );

    component.ngOnInit();

    expect(getAccountsSpy).toHaveBeenCalled();
    expect(component.accounts).toEqual(mockAccounts);
  });

  it('should change the page', () => {
    const mockPageConfig = {
      pageNumber: 10,
      pageSize: 5,
    };
    component.searchForm.setValue({
      query: 'foo',
      itemsPerPage: 15,
    });
    const getAccountsSpy = spyOn(component, 'getAccounts');
    component.pageChange(mockPageConfig);
    expect(getAccountsSpy).toHaveBeenCalledWith(10, 5, null);
  });

  it('should load accounts', () => {
    let mockAccounts: Account[] = [
      {
        id: 'XXXXXX',
        iban: 'DE35653635635663',
        bban: 'BBBAN',
        pan: 'pan',
        maskedPan: 'maskedPan',
        currency: 'EUR',
        msisdn: 'MSISDN',
        name: 'Pupkin',
        product: 'Deposit',
        accountType: AccountType.CASH,
        accountStatus: AccountStatus.ENABLED,
        bic: 'BIChgdgd',
        usageType: UsageType.PRIV,
        details: '',
        linkedAccounts: '',
        balances: [],
      } as Account,
    ];
    const getAccountsSpy = spyOn(accountService, 'getAccounts').and.returnValue(
      of({ accounts: mockAccounts, totalElements: mockAccounts.length })
    );
    component.getAccounts(5, 10, {});
    expect(getAccountsSpy).toHaveBeenCalled();
    expect(component.accounts).toEqual(mockAccounts);
    expect(component.config.totalItems).toEqual(mockAccounts.length);
  });

  it('should change the page size', () => {
    const paginationConfigModel: PaginationConfigModel = {
      itemsPerPage: 0,
      currentPageNumber: 0,
      totalItems: 0,
    };
    component.config = paginationConfigModel;
    component.changePageSize(10);
    expect(component.config.itemsPerPage).toEqual(10);
  });

  it('should return false if account is not set', () => {
    let mockAccount: Account = {
      id: '123456',
      iban: 'DE35653635635663',
      bban: 'BBBAN',
      pan: 'pan',
      maskedPan: 'maskedPan',
      currency: 'EUR',
      msisdn: 'MSISDN',
      name: 'Pupkin',
      product: 'Deposit',
      accountType: AccountType.CASH,
      accountStatus: AccountStatus.DELETED,
      bic: 'BIChgdgd',
      usageType: UsageType.PRIV,
      details: '',
      linkedAccounts: '',
      balances: [],
    } as Account;
    const result = component.goToDepositCash(mockAccount);
    expect(result).toBe(false);
  });
});
