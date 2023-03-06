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
import { JsonService } from '../../../../../services/json.service';

@Component({
  selector: 'app-emb-payment-cancell-post',
  templateUrl: './emb-payment-cancell-post.component.html',
})
export class EmbPaymentCancellPostComponent implements OnInit {
  activeSegment = 'documentation';
  jsonData1: object;
  jsonData2: object;
  jsonData3: object;
  jsonData4: object;
  headers: object = {
    'TPP-Explicit-Authorisation-Preferred': 'false',
    'PSU-ID': 'YOUR_USER_LOGIN',
  };
  body: object;

  constructor(private jsonService: JsonService) {
    this.jsonService.getPreparedJsonData(jsonService.jsonLinks.singlePayment).subscribe(
      (data) => (this.jsonData1 = data),
      (error) => console.log(error)
    );
    this.jsonService.getPreparedJsonData(jsonService.jsonLinks.periodicPayment).subscribe(
      (data) => (this.jsonData2 = data),
      (error) => console.log(error)
    );
    this.jsonService.getPreparedJsonData(jsonService.jsonLinks.bulkPayment).subscribe(
      (data) => (this.jsonData3 = data),
      (error) => console.log(error)
    );
    this.jsonService.getPreparedJsonData(jsonService.jsonLinks.singlePaymentPlayWithData).subscribe(
      (data) => (this.body = data),
      (error) => console.log(error)
    );
    this.jsonService.getPreparedJsonData(jsonService.jsonLinks.debtorAccount).subscribe(
      (data) => (this.jsonData4 = data),
      (error) => console.log(error)
    );
  }

  changeSegment(segment) {
    if (segment === 'documentation' || segment === 'play-data') {
      this.activeSegment = segment;
    }
  }

  ngOnInit() {}
}
