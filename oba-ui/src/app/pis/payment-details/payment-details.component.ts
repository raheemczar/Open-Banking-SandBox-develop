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
import { Subscription } from 'rxjs';

import { PaymentAuthorizeResponse } from '../../api/models';
import { ShareDataService } from '../../common/services/share-data.service';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss'],
})
export class PaymentDetailsComponent implements OnInit {
  private subscriptions: Subscription[] = [];

  public authResponse: PaymentAuthorizeResponse;

  constructor(private sharedService: ShareDataService) {}

  ngOnInit() {
    this.sharedService.currentData.subscribe(
      (authResponse) => (this.authResponse = authResponse)
    );
  }

  get totalAmount(): number {
    if (!this.authResponse || !this.authResponse.payment) {
      return 0;
    }
    let totalAmount = 0;
    this.authResponse.payment.targets.forEach((payment) => {
      totalAmount = totalAmount + payment.instructedAmount.amount;
    });
    return Math.round(totalAmount * 100) / 100;
  }
}
