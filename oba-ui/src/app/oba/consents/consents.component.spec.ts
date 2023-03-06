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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ClipboardModule } from 'ngx-clipboard';
import { InfoService } from '../../common/info/info.service';
import { OnlineBankingService } from '../../common/services/online-banking.service';
import { InfoModule } from '../../common/info/info.module';
import { AuthService } from '../../common/services/auth.service';
import { ConsentsComponent } from './consents.component';
import { ObaAisConsent } from '../../api/models/oba-ais-consent';
import { CmsAisAccountConsent } from '../../api/models/cms-ais-account-consent';
import { of } from 'rxjs';
describe('ConsentsComponent', () => {
  let component: ConsentsComponent;
  let fixture: ComponentFixture<ConsentsComponent>;
  let infoService: InfoService;
  let onlineBankingService: OnlineBankingService;
  const authServiceSpy = jasmine.createSpyObj('AuthService', [
    'getAuthorizedUser',
    'isLoggedIn',
    'logout',
  ]);

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          RouterTestingModule,
          InfoModule,
          ClipboardModule,
        ],
        declarations: [ConsentsComponent],
        providers: [
          TestBed.overrideProvider(AuthService, { useValue: authServiceSpy }),
          InfoService,
          OnlineBankingService,
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsentsComponent);
    component = fixture.componentInstance;
    onlineBankingService = TestBed.inject(OnlineBankingService);
    infoService = TestBed.inject(InfoService);
    fixture.detectChanges();
  });

  /*it('should create', () => { //TODO Fix me!
    expect(component).toBeTruthy();
  });*/

  /*it('should call the consent if enabled', () => {
        let mockConsent: ObaAisConsent= {
            aisAccountConsent: {
                consentStatus : 'VALID'
            }
        }
        const  result = component.isConsentEnabled(mockConsent);
        expect(result).toBe(true);
    });

    it('should call the consent if enabled', () => {
        let mockConsent: ObaAisConsent = {
            aisAccountConsent: {
                consentStatus : 'RECEIVED'
            }
        }
        const  result = component.isConsentEnabled(mockConsent);
        expect(result).toBe(true);
    });*/

  /*it('should copied the Consent', () => {
        let openSpy = spyOn(infoService, 'openFeedback').and.returnValue(of('copied encrypted consent to clipboard', { severity: 'info' }));
        component.copiedConsentSuccessful();
        expect(openSpy).toHaveBeenCalled();
    });

    it('should revoked the consent when consent is false', () => {
        let mockConsent: ObaAisConsent = {
            aisAccountConsent: {
                consentStatus : 'REJECTED'
            }
        }
      const result = component.revokeConsent(mockConsent);
      expect(result).toBe(false);
    });

    it('should revoke the consent when consent is valid and Success', () => {
        let mockConsent: ObaAisConsent= {
            aisAccountConsent: {
                consentStatus : 'VALID'
            }
        }
        let revokeSpy = spyOn(onlineBankingService, 'revokeConsent').and.returnValue(of(false));
        let infoSpy = spyOn(infoService, 'openFeedback');
        component.revokeConsent(mockConsent);
        expect(infoSpy).toHaveBeenCalledWith('could not revoke the consent', { severity: 'error' });
    });*/
});
