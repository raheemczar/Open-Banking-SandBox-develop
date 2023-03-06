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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AccountDetailsTO } from '../../api/models/account-details-to';
import { ConsentAuthorizeResponse } from '../../api/models/consent-authorize-response';
import { RoutingPath } from '../../common/models/routing-path.model';
import { AisService } from '../../common/services/ais.service';
import { CustomizeService } from '../../common/services/customize.service';
import { ShareDataService } from '../../common/services/share-data.service';

@Component({
  selector: 'app-grant-consent',
  templateUrl: './grant-consent.component.html',
  styleUrls: ['./grant-consent.component.scss'],
})
export class GrantConsentComponent implements OnInit, OnDestroy {
  public authResponse: ConsentAuthorizeResponse;
  public encryptedConsentId: string;
  public authorisationId: string;
  public bankOfferedForm: FormGroup;
  public bankOffered: boolean;
  private oauth2Param: boolean;

  private subscriptions: Subscription[] = [];

  constructor(
    public customizeService: CustomizeService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private aisService: AisService,
    private shareService: ShareDataService
  ) {
    this.bankOfferedForm = this.formBuilder.group({});
  }

  get accounts(): Array<AccountDetailsTO> {
    return this.authResponse ? this.authResponse.accounts : [];
  }

  get consentAccounts(): Array<string> {
    return this.authResponse.consent.access.accounts;
  }

  get consentBalances(): Array<string> {
    return this.authResponse.consent.access.balances;
  }

  get consentTransactions(): Array<string> {
    return this.authResponse.consent.access.transactions;
  }

  get bankOfferedConsentFormValid(): boolean {
    return (
      this.consentAccounts.length > 0 ||
      this.consentBalances.length > 0 ||
      this.consentTransactions.length > 0
    );
  }

  public ngOnInit(): void {
    this.subscriptions.push(
      this.shareService.currentData.subscribe((data) => {
        if (data) {
          this.shareService.currentData.subscribe((authResponse) => {
            this.authResponse = authResponse;
            this.bankOffered = this.isBankOfferedConsent();
          });
        }
      })
    );

    this.subscriptions.push(
      this.shareService.oauthParam.subscribe((oauth2: boolean) => {
        this.oauth2Param = oauth2;
      })
    );
  }

  public onSubmit() {
    if (!this.authResponse) {
      console.log('Missing application data');
      return;
    }
    this.subscriptions.push(
      this.aisService
        .startConsentAuth({
          encryptedConsentId: this.authResponse.encryptedConsentId,
          authorisationId: this.authResponse.authorisationId,
          aisConsent: this.authResponse.consent,
        })
        .subscribe((authResponse) => {
          this.authResponse = authResponse;
          this.shareService.changeData(this.authResponse);
          this.router.navigate([
            `${RoutingPath.ACCOUNT_INFORMATION}/${RoutingPath.SELECT_SCA}`,
          ]);
        })
    );
  }

  public onCancel(): void {
    this.subscriptions.push(
      this.aisService
        .revokeConsent({
          encryptedConsentId: this.authResponse.encryptedConsentId,
          authorisationId: this.authResponse.authorisationId,
        })
        .subscribe((authResponse) => {
          this.router
            .navigate(
              [`${RoutingPath.ACCOUNT_INFORMATION}/${RoutingPath.RESULT}`],
              {
                queryParams: {
                  encryptedConsentId: this.authResponse.encryptedConsentId,
                  authorisationId: this.authResponse.authorisationId,
                },
              }
            )
            .then(() => {
              this.authResponse = authResponse;
              this.shareService.changeData(this.authResponse);
            });
        })
    );
  }

  public backToTpp() {
    this.subscriptions.push(
      this.aisService
        .revokeConsent({
          encryptedConsentId: this.authResponse.encryptedConsentId,
          authorisationId: this.authResponse.authorisationId,
        })
        .subscribe(() => {
          window.location.href =
            `/oba-proxy/ais/${this.authResponse.encryptedConsentId}/authorisation/${this.authResponse.authorisationId}` +
            `/done?backToTpp=true&forgetConsent=true&oauth2=${this.oauth2Param}`;
        })
    );
  }

  handleObjectSelectedEvent(value, container): void {
    const idx = container.indexOf(value);
    if (idx > -1) {
      // is currently selected
      container.splice(idx, 1);
    } else {
      // is newly selected
      container.push(value);
    }
  }

  handleIbanCheckbox(value): void {
    // accounts
    this.handleSplice(this.consentAccounts, value, true);

    // balances
    this.handleSplice(this.consentBalances, value, false);

    // transactions
    this.handleSplice(this.consentTransactions, value, false);
  }

  public accountsChecked(account): boolean {
    return this.authResponse.consent.access.accounts.indexOf(account.iban) > -1;
  }

  public balancesChecked(account): boolean {
    return this.authResponse.consent.access.balances.indexOf(account.iban) > -1;
  }

  public transactionsChecked(account): boolean {
    return (
      this.authResponse.consent.access.transactions.indexOf(account.iban) > -1
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private handleSplice(
    consentArray: string[],
    value: string,
    isConsent: boolean
  ): void {
    const idx = consentArray.indexOf(value);
    if (idx > -1) {
      // is currently selected
      consentArray.splice(idx, 1);
    } else if (isConsent) {
      // is newly selected
      this.consentAccounts.push(value);
    }
  }

  private isBankOfferedConsent() {
    return (
      this.isEmptyAccountAccess() &&
      this.isEmptyBalancesAccess() &&
      this.isEmptyTransactionsAccess()
    );
  }

  private isEmptyAccountAccess(): boolean {
    return (
      this.authResponse.consent.access.accounts === null ||
      this.authResponse.consent.access.accounts.length === 0
    );
  }

  private isEmptyBalancesAccess(): boolean {
    return (
      this.authResponse.consent.access.balances === null ||
      this.authResponse.consent.access.balances.length === 0
    );
  }

  private isEmptyTransactionsAccess(): boolean {
    return (
      this.authResponse.consent.access.transactions === null ||
      this.authResponse.consent.access.transactions.length === 0
    );
  }
}
