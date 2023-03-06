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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AisRoutingModule } from './ais-routing.module';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GrantConsentComponent } from './grant-consent/grant-consent.component';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { SelectScaComponent } from './select-sca/select-sca.component';
import { ResultPageComponent } from './result-page/result-page.component';
import { TanConfirmationComponent } from './tan-confirmation/tan-confirmation.component';
import { NotFoundModule } from '../not-found/not-found.module';

@NgModule({
  declarations: [
    LoginComponent,
    GrantConsentComponent,
    AccountDetailsComponent,
    SelectScaComponent,
    ResultPageComponent,
    TanConfirmationComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AisRoutingModule,
    NotFoundModule,
  ],
})
export class AisModule {}