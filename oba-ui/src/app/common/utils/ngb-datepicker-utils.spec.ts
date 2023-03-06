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

import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ngbDateToString, stringToNgbDate } from './ngb-datepicker-utils';

describe('ngb-datepicker-utils', () => {
  const dateInNumber: NgbDateStruct = {
    year: 2010,
    month: 5,
    day: 12,
  };

  const dateInString = '2010-05-12';

  it('should convert ngbDate into String', () => {
    const date = ngbDateToString(dateInNumber, 'yyyy-MM-dd');
    expect(date).toEqual(dateInString);
  });

  it('should convert String into ngbDate', () => {
    const date = stringToNgbDate('2010-05-12', 'yyyy-MM-dd');
    expect(date).toEqual(dateInNumber);
  });
});
