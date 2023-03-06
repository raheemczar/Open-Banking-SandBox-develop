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

import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestDataGenerationService } from './test.data.generation.service';
import { environment } from '../../environments/environment';

describe('TestDataGenerationService', () => {
  let httpMock: HttpTestingController;
  let testDataGenerationService: TestDataGenerationService;
  let url = `${environment.tppBackend}`;
  let userBranch = '';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TestDataGenerationService],
    });
    testDataGenerationService = TestBed.get(TestDataGenerationService);
    httpMock = TestBed.get(HttpTestingController);
  });
  it('should be created', () => {
    const service = TestBed.get(TestDataGenerationService);
    expect(service).toBeTruthy();
  });

  it('should get a generate Iban', () => {
    testDataGenerationService.generateIban(userBranch);
    httpMock.verify();
  });

  it('should generate the example Test Data', () => {
    testDataGenerationService
      .generateExampleTestData('accountId')
      .subscribe((data: any) => {
        expect(data).toBe('accountId');
      });
    const req = httpMock.expectOne(url + 'accountId');
    expect(req.request.method).toBe('GET');
    req.flush('accountId');
    httpMock.verify();
  });

  it('should generate the Test Data', () => {
    testDataGenerationService.generateTestData('EUR', true);
    httpMock.verify();
  });
});
