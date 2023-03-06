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

import { RedirectComponent } from './components/redirect/redirect.component';
import { TestCasesComponent } from './test-cases.component';
import { EmbeddedComponent } from './components/embedded/embedded.component';
import { TestingFlowsComponent } from './components/testing-flows/testing-flows.component';
import { PostmanTestingComponent } from './components/postman-testing/postman-testing.component';
import { LineCommandComponent } from '../common/line-command/line-command.component';
import { CodeAreaComponent } from '../common/code-area/code-area.component';
import { RdctConsentPOSTComponent } from './components/api-endpoints/rdct-consent-post/rdct-consent-post.component';
import { RdctPaymentCancellationPostComponent } from './components/api-endpoints/rdct-payment-cancellation-post/rdct-payment-cancellation-post.component';
import { RdctPaymentInitiationPostComponent } from './components/api-endpoints/rdct-payment-initiation-post/rdct-payment-initiation-post.component';
import { RdctPaymentCancellationDeleteComponent } from './components/api-endpoints/rdct-payment-cancellation-delete/rdct-payment-cancellation-delete.component';
import { RdctPaymentStatusGetComponent } from './components/api-endpoints/rdct-payment-status-get/rdct-payment-status-get.component';
import { EmbConsentCreatePostComponent } from './components/api-endpoints/emb-consent-create-post/emb-consent-create-post.component';
import { EmbConsentAuthPostComponent } from './components/api-endpoints/emb-consent-auth-post/emb-consent-auth-post.component';
import { EmbConsentPutComponent } from './components/api-endpoints/emb-consent-put/emb-consent-put.component';
import { EmbConsentGetComponent } from './components/api-endpoints/emb-consent-get/emb-consent-get.component';
import { EmbPaymentCancellDeleteComponent } from './components/api-endpoints/emb-payment-cancell-delete/emb-payment-cancell-delete.component';
import { EmbPaymentCancellationPostComponent } from './components/api-endpoints/emb-payment-cancellation-post/emb-payment-cancellation-post.component';
import { EmbPaymentCancellPutComponent } from './components/api-endpoints/emb-payment-cancell-put/emb-payment-cancell-put.component';
import { EmbPaymentInitCreatePostComponent } from './components/api-endpoints/emb-payment-init-create-post/emb-payment-init-create-post.component';
import { EmbPaymentCancellGetComponent } from './components/api-endpoints/emb-payment-cancell-get/emb-payment-cancell-get.component';
import { EmbPaymentInitAuthPostComponent } from './components/api-endpoints/emb-payment-init-auth-post/emb-payment-init-auth-post.component';
import { EmbPaymentInitPutComponent } from './components/api-endpoints/emb-payment-init-put/emb-payment-init-put.component';
import { EmbPaymentInitGetComponent } from './components/api-endpoints/emb-payment-init-get/emb-payment-init-get.component';
import { PlayWthDataComponent } from './components/play-with-data/play-wth-data.component';
import { PrettyJsonPipe } from '../../pipes/pretty-json.pipe';
import { CommonModule } from '@angular/common';
import { TestCasesRoutingModule } from './test-cases-routing.module';
import { FormsModule } from '@angular/forms';
import { ngxLoadingAnimationTypes, NgxLoadingModule } from 'ngx-loading';
import { TranslateModule } from '@ngx-translate/core';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { EmbPaymentCancellPostComponent } from './components/api-endpoints/emb-payment-cancell-post/emb-payment-cancell-post.component';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { PopUpComponent } from './components/play-with-data/pop-up/pop-up.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { CertificateService } from '../../services/certificate.service';
import { FundsConfirmationComponent } from './components/api-endpoints/funds-confirmation/funds-confirmation.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    RedirectComponent,
    TestCasesComponent,
    EmbeddedComponent,
    TestingFlowsComponent,
    PostmanTestingComponent,
    LineCommandComponent,
    CodeAreaComponent,
    RdctConsentPOSTComponent,
    RdctPaymentCancellationPostComponent,
    RdctPaymentCancellationDeleteComponent,
    RdctPaymentInitiationPostComponent,
    RdctPaymentStatusGetComponent,
    EmbConsentCreatePostComponent,
    EmbConsentAuthPostComponent,
    EmbConsentPutComponent,
    EmbConsentGetComponent,
    EmbPaymentCancellPostComponent,
    EmbPaymentCancellDeleteComponent,
    EmbPaymentCancellationPostComponent,
    EmbPaymentCancellPutComponent,
    EmbPaymentCancellGetComponent,
    EmbPaymentInitCreatePostComponent,
    EmbPaymentInitAuthPostComponent,
    EmbPaymentInitPutComponent,
    EmbPaymentInitGetComponent,
    PlayWthDataComponent,
    PrettyJsonPipe,
    PopUpComponent,
    FundsConfirmationComponent,
  ],
  imports: [
    CommonModule,
    TestCasesRoutingModule,
    FormsModule,
    BrowserModule,
    NgxLoadingModule.forRoot({
      animationType: ngxLoadingAnimationTypes.wanderingCubes,
    }),
    TranslateModule,
    NgxImageZoomModule,
    MarkdownModule.forRoot(),
    NgbModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
  ],
  providers: [CertificateService],
  exports: [LineCommandComponent, PlayWthDataComponent, CodeAreaComponent],
  entryComponents: [PopUpComponent],
})
export class TestCasesModule {}
