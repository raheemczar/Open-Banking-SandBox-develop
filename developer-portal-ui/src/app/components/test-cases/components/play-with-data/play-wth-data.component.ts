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

import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { RestService } from '../../../../services/rest.service';
import { DataService } from '../../../../services/data.service';
import { getStatusText } from 'http-status-codes';
import { CopyService } from '../../../../services/copy.service';
import { ConsentTypes } from '../../../../models/consentTypes.model';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { JsonService } from '../../../../services/json.service';
import * as vkbeautify from 'vkbeautify';
import { AspspService } from '../../../../services/aspsp.service';
import { PaymentType, PaymentTypesMatrix } from '../../../../models/paymentTypesMatrix.model';
import { AcceptType } from '../../../../models/acceptType.model';
import * as uuid from 'uuid';
import { GoogleAnalyticsService } from '../../../../services/google-analytics.service';
import { CertificateService } from '../../../../services/certificate.service';
import { EVENT_VALUE, SLICE_DATE_FROM_ISO_STRING } from '../../../common/constant/constants';
import { formatDate } from '@angular/common';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-play-wth-data',
  templateUrl: './play-wth-data.component.html',
  styleUrls: ['./play-wth-data.component.scss'],
})
export class PlayWthDataComponent implements OnInit {
  @Input() method: string;
  @Input() headers: object;
  @Input() body;
  @Input() url: string;
  @Input() accountIdFlag: boolean;
  @Input() bookingStatusFlag: boolean;
  @Input() transactionIdFlag: boolean;
  @Input() paymentServiceFlag: boolean;
  @Input() paymentProductFlag: boolean;
  @Input() paymentIdFlag: boolean;
  @Input() cancellationIdFlag: boolean;
  @Input() consentIdFlag: boolean;
  @Input() authorisationIdFlag: boolean;
  @Input() variablePathEnd: string;
  @Input() fieldsToCopy: string[];
  @Input() dateFromFlag: boolean;
  @Input() consentTypeFlag: boolean;
  @Input() consentTypes: ConsentTypes;
  @Input() paymentId;
  @Input() cancellationId = '';
  @Input() consentId = '';
  @Input() authorisationId = '';
  @Input() accountId = '';
  @Input() transactionId = '';
  @Input() resourceIds = [];
  @Input() acceptFlag: boolean;
  @Input() eventName: string;
  @Input() eventCategory: string;
  @Input() eventAction: string;
  @Input() eventLabel: string;

  response: HttpResponse<any>;
  finalUrl: string;
  paymentService = '';
  paymentProduct = '';

  bookingStatus = '';
  redirectUrl = '';
  dateFrom = '';
  xml = false;

  paymentServiceSelect = [];
  paymentProductSelect = [];
  bookingStatusSelect = [];
  acceptTypes = [];
  selectedConsentType = 'dedicatedAccountsConsent';

  paymentTypesMatrix: PaymentTypesMatrix;
  paymentTypes = [PaymentType.single, PaymentType.bulk, PaymentType.periodic];
  acceptHeader;
  certificate: string;
  booleanValues = ['true', 'false'];

  default = true;

  private disabledHeaders = [];

  constructor(
    public restService: RestService,
    public dataService: DataService,
    public copyService: CopyService,
    public jsonService: JsonService,
    public aspspService: AspspService,
    private http: HttpClient,
    private certificateService: CertificateService,
    private googleAnalyticsService: GoogleAnalyticsService,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  getStatusText(status) {
    if (status) {
      return getStatusText(status);
    } else {
      return '';
    }
  }

  sendRequest() {
    this.sendGoogleAnalytics();
    this.dataService.setIsLoading(true);
    this.finalUrl = this.composeUrl();

    const respBodyEl: any = this.xml ? document.getElementById('textAreaXml') : document.getElementById('textArea');
    const requestBody = respBodyEl ? respBodyEl.value.toString() : {};

    this.restService.sendRequest(this.method, this.finalUrl, this.buildHeadersForRequest(), this.acceptHeader, requestBody).subscribe(
      (resp) => {
        if (this.acceptHeader === AcceptType.xml) {
          resp.body = vkbeautify.xml(resp.body);
        }
        this.processResponse(resp);
        this.dataService.setIsLoading(false);
        this.dataService.showToast('Request sent', 'Success!', 'success');
      },
      (err) => {
        this.dataService.setIsLoading(false);
        this.dataService.showToast('Something went wrong!', 'Error!', 'error');
        if (this.acceptHeader === AcceptType.xml) {
          err.error = vkbeautify.xml(err.error);
        }

        this.response = Object.assign(err);
      }
    );
  }

  trackByFn(index: any) {
    return index;
  }

  handleConsentSelected(consentType: string) {
    this.body = this.consentTypes[consentType];
  }

  ngOnInit() {
    this.aspspService.getAspspProfile().subscribe((data) => {
      if (data.pis.supportedPaymentTypeAndProductMatrix) {
        this.paymentTypesMatrix = data.pis.supportedPaymentTypeAndProductMatrix;
        this.setPaymentServicesAndProducts();
        this.setBookingStatuses(data.ais.transactionParameters.availableBookingStatuses);
        this.setDefaultFields();
        this.setAcceptTypes(data.ais.transactionParameters.supportedTransactionApplicationTypes);
      }

      if (this.headers) {
        this.setDefaultHeaders();
      }
    });

    this.certificate = this.certificateService.getStoredCertificate();

    this.certificateService.currentDefault.subscribe((data) => (this.default = data));
  }

  handlePaymentServiceChanged(paymentService: string) {
    this.paymentProductSelect = this.paymentTypesMatrix[paymentService];
    this.paymentProduct = '/' + this.paymentProductSelect[0];
    this.updateBodyExample();
  }

  handlePaymentProductChanged(paymentProduct: string) {
    this.paymentProduct = paymentProduct;
    this.updateBodyExample();
  }

  onClear() {
    this.response = undefined;
    this.redirectUrl = undefined;
    this.paymentId = '';
    this.accountId = '';
    this.authorisationId = '';
    this.cancellationId = '';
  }

  disableHeader(event: any) {
    const checkbox = event.target;

    if (checkbox) {
      const value = checkbox.value;
      const input = document.getElementById(value);

      if (input) {
        const attributeName = 'disabled';

        if (checkbox.checked) {
          input.removeAttribute(attributeName);
          this.disabledHeaders = this.disabledHeaders.filter((v) => v !== value);
          if (value === 'TPP-QWAC-Certificate') {
            this.certificateService.setDefault(false);
          }
        } else {
          input.setAttribute(attributeName, 'true');
          this.disabledHeaders.push(value);
          if (value === 'TPP-QWAC-Certificate') {
            this.certificateService.setDefault(true);
          }
        }
      }
    }
  }

  isBooleanValue(item: any) {
    return item.value === 'true' || item.value === 'false';
  }

  changeBooleanHeader(key: any, value: any) {
    this.headers[key] = value;
  }

  updateCertificate($event) {
    this.headers['TPP-QWAC-Certificate'] = $event;
  }

  private setPaymentServicesAndProducts() {
    for (const paymentType of this.paymentTypes) {
      const matrixElement = this.paymentTypesMatrix[paymentType];

      if (matrixElement && matrixElement.length > 0) {
        this.paymentServiceSelect.push(paymentType);

        if (this.paymentService === '') {
          this.paymentService = paymentType;

          if (this.paymentProductFlag) {
            this.paymentProductSelect = matrixElement;
            this.paymentProduct = '/' + this.paymentProductSelect[0];
          }
        }
      }
    }
  }

  private setBookingStatuses(bookingStatuses?: Array<string>) {
    if (bookingStatuses && this.bookingStatusFlag && bookingStatuses.length > 0) {
      this.bookingStatus = bookingStatuses[0];
      this.bookingStatusSelect = bookingStatuses;
    } else {
      this.bookingStatus = '';
    }
  }

  private setAcceptTypes(supportedTransactionApplicationTypes: Array<string>) {
    if (this.acceptFlag && supportedTransactionApplicationTypes && supportedTransactionApplicationTypes.length > 0) {
      this.acceptTypes = supportedTransactionApplicationTypes;
      this.acceptHeader = supportedTransactionApplicationTypes[0];
    } else {
      this.acceptHeader = '';
    }
  }

  private setDefaultFields() {
    this.paymentId = this.paymentIdFlag ? this.paymentId : '';
    this.cancellationId = this.cancellationIdFlag ? this.cancellationId : '';
    this.consentId = this.consentIdFlag ? this.consentId : '';
    this.authorisationId = this.authorisationIdFlag ? this.authorisationId : '';
    this.accountId = this.accountIdFlag ? this.accountId : '';
    this.transactionId = this.transactionIdFlag ? this.transactionId : '';

    this.dateFrom = this.dateFromFlag ? new Date().toISOString().slice(0, SLICE_DATE_FROM_ISO_STRING) : '';
    this.fieldsToCopy = this.fieldsToCopy ? this.fieldsToCopy : [];
  }

  private updateBodyExample() {
    if (this.body) {
      if (this.paymentProduct.includes('pain')) {
        this.jsonService.getPreparedXmlData(this.paymentService + this.paymentProduct).subscribe((data) => {
          if (data && data !== '') {
            this.xml = true;
            this.body = vkbeautify.xml(data);
          }
        });
      } else {
        this.jsonService
          .getPreparedJsonData(this.paymentService + this.paymentProduct, this.paymentProduct === '/sepa-credit-transfers')
          .pipe(
            map((result) => {
              const now = new Date();
              const monthToBeAdded = 7;
              let copy;
              if (this.paymentService === 'payments' || this.paymentService === 'bulk-payments') {
                copy = { ...result };
              } else if (this.paymentService === 'periodic-payments') {
                copy = {
                  ...result,
                  startDate: formatDate(now, 'yyyy-MM-dd', this.locale),
                  endDate: formatDate(
                    new Date(now.getFullYear(), now.getMonth() + monthToBeAdded, now.getDay()),
                    'yyyy-MM-dd',
                    this.locale
                  ),
                };
              }
              return copy;
            })
          )
          .subscribe((data) => {
            this.xml = false;
            this.body = data;
          });
      }
    }
  }

  private setDefaultHeaders() {
    this.headers['TPP-QWAC-Certificate'] = this.certificate;

    if (this.default) {
      this.disabledHeaders.push('TPP-QWAC-Certificate');
    }

    this.headers['X-Request-ID'] = uuid.v4();
    this.setIpAddress();
  }

  private setIpAddress() {
    return this.http.get('https://api.ipify.org/?format=json').subscribe(
      (ip) => (this.headers['PSU-IP-Address'] = ip['ip']),
      () => (this.headers['PSU-IP-Address'] = '1.1.1.1')
    );
  }

  private buildHeadersForRequest() {
    if (this.headers) {
      const requestHeaders = {};

      for (const key of Object.keys(this.headers)) {
        if (this.headers[key]) {
          requestHeaders[key] = this.headers[key];
        }
      }

      requestHeaders['Content-Type'] = this.xml ? 'application/xml' : 'application/json';
      requestHeaders['Accept'] = this.acceptHeader ? this.acceptHeader : 'application/json';

      for (const disabled of this.disabledHeaders) {
        delete requestHeaders[disabled];
      }

      return new HttpHeaders(requestHeaders);
    }
  }

  private sendGoogleAnalytics() {
    if (this.googleAnalyticsService.enabled) {
      this.googleAnalyticsService.eventEmitter(this.eventName, this.eventCategory, this.eventAction, this.eventLabel, EVENT_VALUE);
    }
  }

  private composeUrl(): string {
    let finalUrl = this.url;
    if (this.paymentServiceFlag) {
      finalUrl += this.paymentService + this.paymentProduct;
      if (this.paymentIdFlag) {
        finalUrl += this.paymentId ? '/' + this.paymentId : '';
      }
      finalUrl += this.variablePathEnd ? this.variablePathEnd : '';
      finalUrl += this.authorisationId ? '/' + this.authorisationId : '';
      finalUrl += this.cancellationId ? '/' + this.cancellationId : '';
    } else if (this.consentIdFlag) {
      finalUrl += '/' + this.consentId;
      finalUrl += this.variablePathEnd ? this.variablePathEnd : '';
      finalUrl += this.authorisationId ? '/' + this.authorisationId : '';
    } else if (this.accountIdFlag) {
      finalUrl += '/' + this.accountId;
      finalUrl += this.variablePathEnd ? this.variablePathEnd : '';
      finalUrl += this.dateFrom ? '?dateFrom=' + this.dateFrom : '';
      finalUrl += this.bookingStatus ? '&bookingStatus=' + this.bookingStatus : '';
      finalUrl += this.transactionId ? '/' + this.transactionId : '';
    }

    return finalUrl;
  }

  private processResponse(resp): void {
    this.response = Object.assign(resp);

    if (this.response.body.hasOwnProperty('_links') && this.response.body._links.hasOwnProperty('scaRedirect')) {
      this.redirectUrl = this.response.body._links.scaRedirect.href;
    } else if (this.response.body.hasOwnProperty('paymentId')) {
      this.paymentId = this.response.body.paymentId;
      LocalStorageService.set('paymentId', this.response.body.paymentId);
    } else if (this.response.body.hasOwnProperty('authorisationId')) {
      this.authorisationId = this.response.body.authorisationId;
      LocalStorageService.set('authorisationId', this.authorisationId);
    } else if (this.response.body.hasOwnProperty('consentId')) {
      this.consentId = this.response.body.consentId;
      LocalStorageService.set('consentId', this.consentId);
    } else if (this.response.body.hasOwnProperty('cancellationId')) {
      this.cancellationId = this.response.body.cancellationId;
      LocalStorageService.set('cancellationId', this.cancellationId);
    } else if (this.response.body.hasOwnProperty('accountId')) {
      this.accountId = this.response.body.accountId;
      LocalStorageService.set('accountId', this.accountId);
    } else if (this.response.body.hasOwnProperty('transactionId')) {
      this.transactionId = this.response.body.transactionId;
      LocalStorageService.set('transactionId', this.transactionId);
    } else if (this.response.body.hasOwnProperty('accounts')) {
      for (const a of this.response.body.accounts) {
        const id = a.resourceId;
        if (id) {
          this.resourceIds.push(id);
        }
      }
    }
  }
}
