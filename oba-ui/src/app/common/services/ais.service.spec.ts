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
import { TestBed, waitForAsync } from '@angular/core/testing';
import { from } from 'rxjs';

import { ConsentAuthorizeResponse } from '../../api/models/consent-authorize-response';
import { AisService } from './ais.service';

import LoginUsingPOSTParams = PSUAISProvidesAccessToOnlineBankingAccountFunctionalityService.LoginUsingPOSTParams;
import { PSUAISProvidesAccessToOnlineBankingAccountFunctionalityService } from '../../api/services/psuaisprovides-access-to-online-banking-account-functionality.service';
import AisAuthGetGETParams = PSUAISProvidesAccessToOnlineBankingAccountFunctionalityService.AisAuthUsingGETParams;
import RevokeConsentUsingDELETEParams = PSUAISProvidesAccessToOnlineBankingAccountFunctionalityService.RevokeConsentUsingDELETEParams;
beforeEach(
  waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [],
    });
  })
);

describe('AisService', () => {
  let aisService: AisService;
  let params: LoginUsingPOSTParams;
  let authResponse: ConsentAuthorizeResponse;
  let aisServicePSUAIS: PSUAISProvidesAccessToOnlineBankingAccountFunctionalityService;
  beforeEach(() => {
    aisService = TestBed.inject(AisService);
    aisServicePSUAIS = TestBed.inject(
      PSUAISProvidesAccessToOnlineBankingAccountFunctionalityService
    );
    params = {
      pin: '12345',
      login: 'anton.brueckner',
      encryptedConsentId: '45678uztredf899',
      authorisationId: '0987654wertzuio',
    };
    authResponse = {
      authMessageTemplate: 'etwas',
      authorisationId: '45678uztredf899',
      scaStatus: 'received',
      scaMethods: [
        {
          id: '1903',
          methodValue: 'SMS sca method',
          scaMethod: 'EMAIL',
        },
      ],
    };
  });

  it('should check that the functions are defined', () => {
    expect(aisService).toBeTruthy();
    expect(aisService.aisAuthorise).not.toBeNull();
  });

  it('Should check that the method "authorise" is called', () => {
    let result: ConsentAuthorizeResponse = null;

    spyOn(aisService, 'aisAuthorise').and.returnValue(from([authResponse]));

    aisService
      .aisAuthorise(params)
      .subscribe((response) => (result = response));

    expect(result).not.toBeNull();
    expect(result.scaStatus).toEqual(authResponse.scaStatus);
    expect(result.scaMethods).toEqual(authResponse.scaMethods);
    expect(aisService.aisAuthorise).toHaveBeenCalledTimes(1);
  });

  it('should call the ais AuthCode', () => {
    const mockAisAuth: AisAuthGetGETParams = {
      redirectId: 'ierzbvbrivuzer869fzgvFDZUIUZGAVOSp72ftgiqehfbq',
      encryptedConsentId:
        'vwhjkrbv86oFZIVGSHRJHVAZOXVWGREIIlwjrnvvwrwrnjvnlwrvnwrjnvLKN',
    };
    const loginUsingPOSTSpy = spyOn(
      aisServicePSUAIS,
      'aisAuthUsingGETResponse'
    );
    aisService.aisAuthCode(mockAisAuth);
    expect(loginUsingPOSTSpy).toHaveBeenCalledWith(mockAisAuth);
  });

  it('should call the ais authorize', () => {
    const mockLogin: LoginUsingPOSTParams = {
      encryptedConsentId: 'igbdvcg8679230zHUDhsjkldbv978soibv3on9urgvbeu',
      authorisationId: 'iwbhv7809sugibpf8h20n384gvbeiO(/GS/p',
      pin: '12345',
      login: 'foo',
      Cookie: 'gf2ziuoge79tUGJDX^^8s9upgidouqwlejbf910qieflnqebf',
    };
    const loginUsingPOSTSpy = spyOn(aisServicePSUAIS, 'loginUsingPOST');
    aisService.aisAuthorise(mockLogin);
    expect(loginUsingPOSTSpy).toHaveBeenCalledWith(mockLogin);
  });

  it('should call the ais getAccountList', () => {
    const mockListOfAccountsSpy = spyOn(
      aisServicePSUAIS,
      'getListOfAccountsUsingGET'
    );
    aisService.getAccountsList();
    expect(mockListOfAccountsSpy).toHaveBeenCalled();
  });

  it('should call the start consent', () => {
    const mockAisStart: PSUAISProvidesAccessToOnlineBankingAccountFunctionalityService.StartConsentAuthUsingPOSTParams = {
      authorisationId: 'ierzbvbrivuzer869fzgvFDZUIUZGAVOSp72ftgiqehfbq',
      encryptedConsentId:
        'vwhjkrbv86oFZIVGSHRJHVAZOXVWGREIIlwjrnvvwrwrnjvnlwrvnwrjnvLKN',
      aisConsent: {
        access: {},
        frequencyPerDay: 5,
        id: '12345',
        recurringIndicator: false,
        tppId: 'tppId',
        userId: 'userId',
        validUntil: 'validUntil',
      },
    };
    const startSpy = spyOn(aisServicePSUAIS, 'startConsentAuthUsingPOST');
    aisService.startConsentAuth(mockAisStart);
    expect(startSpy).toHaveBeenCalledWith(mockAisStart);
  });

  it('should call the select sca Method', () => {
    const mockScaMethod: PSUAISProvidesAccessToOnlineBankingAccountFunctionalityService.SelectMethodUsingPOSTParams = {
      authorisationId: 'ierzbvbrivuzer869fzgvFDZUIUZGAVOSp72ftgiqehfbq',
      encryptedConsentId:
        'vwhjkrbv86oFZIVGSHRJHVAZOXVWGREIIlwjrnvvwrwrnjvnlwrvnwrjnvLKN',
      scaMethodId: '123456',
      Cookie: 'gf2ziuoge79tUGJDX^^8s9upgidouqwlejbf910qieflnqebf',
    };
    const selectSpy = spyOn(aisServicePSUAIS, 'selectMethodUsingPOST');
    aisService.selectScaMethod(mockScaMethod);
    expect(selectSpy).toHaveBeenCalledWith(mockScaMethod);
  });

  it('should call the authorize consent', () => {
    const mockAuthConsent: PSUAISProvidesAccessToOnlineBankingAccountFunctionalityService.AuthrizedConsentUsingPOSTParams = {
      authorisationId: 'ierzbvbrivuzer869fzgvFDZUIUZGAVOSp72ftgiqehfbq',
      encryptedConsentId:
        'vwhjkrbv86oFZIVGSHRJHVAZOXVWGREIIlwjrnvvwrwrnjvnlwrvnwrjnvLKN',
      authCode: 'lwuirbfgowbrfwowcnfub3479wneupno9B7QwN 89ZUAB OS79tbdwdwdq',
      Cookie: 'gf2ziuoge79tUGJDX^^8s9upgidouqwlejbf910qieflnqebf',
    };
    const authSpy = spyOn(aisServicePSUAIS, 'authrizedConsentUsingPOST');
    aisService.authrizedConsent(mockAuthConsent);
    expect(authSpy).toHaveBeenCalledWith(mockAuthConsent);
  });

  it('should call the revoked consent', () => {
    const mockAuthConsent: RevokeConsentUsingDELETEParams = {
      authorisationId: 'ierzbvbrivuzer869fzgvFDZUIUZGAVOSp72ftgiqehfbq',
      encryptedConsentId:
        'vwhjkrbv86oFZIVGSHRJHVAZOXVWGREIIlwjrnvvwrwrnjvnlwrvnwrjnvLKN',
      Cookie: 'gf2ziuoge79tUGJDX^^8s9upgidouqwlejbf910qieflnqebf',
    };
    const authSpy = spyOn(aisServicePSUAIS, 'revokeConsentUsingDELETE');
    aisService.revokeConsent(mockAuthConsent);
    expect(authSpy).toHaveBeenCalledWith(mockAuthConsent);
  });

  it('should call the ais done', () => {
    const mockAuthConsent: PSUAISProvidesAccessToOnlineBankingAccountFunctionalityService.AisDoneUsingGETParams = {
      authorisationId: 'ierzbvbrivuzer869fzgvFDZUIUZGAVOSp72ftgiqehfbq',
      encryptedConsentId:
        'vwhjkrbv86oFZIVGSHRJHVAZOXVWGREIIlwjrnvvwrwrnjvnlwrvnwrjnvLKN',
      Cookie: 'gf2ziuoge79tUGJDX^^8s9upgidouqwlejbf910qieflnqebf',
      authConfirmationCode: 'igowufvbjksfbGZIVAZVDG7829z4rhjkBAhvdlhasva',
      oauth2: false,
    };
    const authSpy = spyOn(aisServicePSUAIS, 'aisDoneUsingGET');
    aisService.aisDone(mockAuthConsent);
    expect(authSpy).toHaveBeenCalledWith(mockAuthConsent);
  });
});
