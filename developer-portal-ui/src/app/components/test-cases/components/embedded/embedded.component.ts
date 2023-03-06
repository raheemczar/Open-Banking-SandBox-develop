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
import { LanguageService } from '../../../../services/language.service';
import { CustomizeService } from '../../../../services/customize.service';

@Component({
  selector: 'app-get-started',
  templateUrl: './embedded.component.html',
  styleUrls: ['./embedded.component.scss'],
})
export class EmbeddedComponent implements OnInit {
  thumbImage = '../../../../assets/images/embedded_pis_initiation_thumb.svg';
  fullImage = '../../../../assets/images/embedded_pis_initiation.svg';
  mode = 'hover-freeze';

  pathToEmbedded = `./assets/content/i18n/en/test-cases/embedded.md`;

  constructor(private languageService: LanguageService, private customizeService: CustomizeService) {}

  ngOnInit(): void {
    this.languageService.currentLanguage.subscribe((data) => {
      this.pathToEmbedded = `${this.customizeService.currentLanguageFolder}/${data}/test-cases/embedded.md`;
    });
  }
}
