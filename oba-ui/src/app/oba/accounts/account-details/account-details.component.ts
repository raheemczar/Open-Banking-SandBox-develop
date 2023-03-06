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

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, map, tap } from 'rxjs/operators';

import { AccountDetailsTO, TransactionTO } from '../../../api/models';
import { OnlineBankingAccountInformationService } from '../../../api/services/online-banking-account-information.service';
import { OnlineBankingService } from '../../../common/services/online-banking.service';
import {
  CustomNgbDateAdapter,
  ngbDateToString,
} from '../../../common/utils/ngb-datepicker-utils';
import { ExtendedBalance } from '../../../api/models/extendedBalance';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
})
export class AccountDetailsComponent implements OnInit {
  account: AccountDetailsTO;
  balance: ExtendedBalance;
  accountID: string;
  transactions: TransactionTO[];
  filtersGroup: FormGroup;
  formModel: FormGroup;
  config: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    maxSize: number;
  } = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0,
    maxSize: 7,
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private onlineBankingService: OnlineBankingService
  ) {}

  ngOnInit() {
    const today = new Date();

    this.filtersGroup = this.fb.group({
      dateFrom: [
        new CustomNgbDateAdapter().fromModel(today),
        Validators.required,
      ],
      dateTo: [
        new CustomNgbDateAdapter().fromModel(today),
        Validators.required,
      ],
    });

    this.formModel = this.fb.group({
      itemsPerPage: [this.config.itemsPerPage, Validators.required],
    });
    this.activatedRoute.params
      .pipe(map((resp) => resp.id))
      .subscribe((accountID: string) => {
        this.accountID = accountID;
        this.getAccountDetail();
        this.refreshTransactions();
      });
    this.onQueryTransactions();
  }

  getAccountDetail() {
    this.onlineBankingService
      .getAccount(this.accountID)
      .subscribe((account: AccountDetailsTO) => {
        this.account = account;
        this.balance = new ExtendedBalance(account);
        console.log(this.balance);
      });
  }

  refreshTransactions() {
    this.getTransactions(this.config.currentPage, this.config.itemsPerPage);
  }

  getTransactions(page: number, size: number) {
    const params = {
      accountId: this.accountID,
      dateFrom: ngbDateToString(this.filtersGroup.get('dateFrom').value),
      dateTo: ngbDateToString(this.filtersGroup.get('dateTo').value),
      page: page - 1,
      size,
    } as OnlineBankingAccountInformationService.TransactionsUsingGETParams;
    this.onlineBankingService.getTransactions(params).subscribe((response) => {
      this.transactions = response.content;
      this.config.totalItems = response.totalElements;
    });
  }

  pageChange(pageNumber: number) {
    this.config.currentPage = pageNumber;
    this.getTransactions(pageNumber, this.config.itemsPerPage);
  }

  onQueryTransactions() {
    this.formModel.valueChanges
      .pipe(
        tap((val) => {
          this.formModel.patchValue(val, { emitEvent: false });
        }),
        debounceTime(750)
      )
      .subscribe((form) => {
        this.config.itemsPerPage = form.itemsPerPage;
        this.getTransactions(1, this.config.itemsPerPage);
      });
  }
}
