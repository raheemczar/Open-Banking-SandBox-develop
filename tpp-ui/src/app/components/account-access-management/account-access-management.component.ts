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
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Account } from '../../models/account.model';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { InfoService } from '../../commons/info/info.service';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs/operators';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { ADMIN_KEY } from '../../commons/constant/constant';
import { TppManagementService } from '../../services/tpp-management.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-account-access-management',
  templateUrl: './account-access-management.component.html',
  styleUrls: ['./account-access-management.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AccountAccessManagementComponent implements OnInit, OnDestroy {
  admin: string;
  users: User[];
  account: Account;
  subscription = new Subscription();
  tppId: string;
  accountAccessForm: FormGroup;

  submitted = false;
  errorMessage = null;
  accessTypes = ['OWNER', 'READ', 'DISPOSE'];

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private tppManagementService: TppManagementService,
    private infoService: InfoService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.route.params.subscribe((params) => {
      this.accountService
        .getAccount(params.id)
        .subscribe((account: Account) => {
          this.account = account;
        });
    });
  }

  ngOnInit() {
    this.admin = sessionStorage.getItem(ADMIN_KEY);
    this.listUsers();
    this.setupAccountAccessFormControl();
    this.route.queryParams.subscribe((params) => {
      this.tppId = params['tppId'];
    });
  }

  setupAccountAccessFormControl(): void {
    this.accountAccessForm = this.formBuilder.group({
      iban: [''],
      currency: [''],
      id: ['', Validators.required],
      scaWeight: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      accessType: ['READ', [Validators.required]],
      accountId: [''],
    });
  }
  listUsers() {
    const MAX_VALUE = 2147483647;
    if (this.admin === 'true') {
      this.tppManagementService.getAllUsers(0, 500).subscribe((resp: any) => {
        this.users = resp.users;
      });
    } else {
      this.userService.listUsers(0, MAX_VALUE).subscribe((resp: any) => {
        this.users = resp.users;
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.accountAccessForm.invalid) {
      return;
    }
    this.accountAccessForm.get('iban').setValue(this.account.iban);
    this.accountAccessForm.get('currency').setValue(this.account.currency);
    this.accountAccessForm.get('accountId').setValue(this.account.id);
    if (this.admin === 'true') {
      this.tppManagementService.getTppById(this.tppId).subscribe((response) => {
        this.infoService.openFeedback(
          'Access to account ' + this.account.iban + ' successfully granted',
          { duration: 3000 }
        );

        setTimeout(() => {
          this.location.back();
        }, 3000);
      });
    } else if (this.admin === 'false') {
      this.accountService
        .updateAccountAccessForUser(this.accountAccessForm.getRawValue())
        .subscribe((response) => {
          this.infoService.openFeedback(
            'Access to account ' + this.account.iban + ' successfully granted',
            { duration: 3000 }
          );

          setTimeout(() => {
            this.location.back();
          }, 3000);
        });
    }
  }

  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  focus$ = new Subject<User[]>();
  click$ = new Subject<User[]>();

  search: (obs: Observable<string>) => Observable<User[]> = (
    text$: Observable<string>
  ) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup$ = this.click$.pipe(
      filter(() => !this.instance.isPopupOpen())
    );
    const inputFocus$ = this.focus$;
    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((searchText: string) =>
        searchText === ''
          ? this.users
          : this.users.filter(
              (user) =>
                user.login.toLowerCase().indexOf(searchText.toLowerCase()) > -1
            )
      )
    );
  };

  public inputFormatterValue = (user: User) => {
    if (user) {
      return user.login;
    }
    return user;
  };

  public resultFormatterValue = (user: User) => {
    if (user) {
      this.accountAccessForm.get('id').setValue(user.id);
      return user.login;
    }
    return user;
  };

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  cancel() {
    this.location.back();
  }
}
