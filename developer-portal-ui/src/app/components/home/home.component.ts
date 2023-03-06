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

import { AfterViewInit, Component, OnInit } from '@angular/core';

import { CustomizeService } from '../../services/customize.service';
import { ContactInfo, Theme } from '../../models/theme.model';
import { LanguageService } from '../../services/language.service';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatSnackBar } from '@angular/material/snack-bar';
import browser from 'browser-detect';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  today = +new Date();
  contactInfo: ContactInfo;
  slides = [
    {
      title: 'HOME.FEATURES.SLIDES.SLIDE_1.TITLE',
      description: 'HOME.FEATURES.SLIDES.SLIDE_1.CONTENT',
      photoUrl: '../../assets/icons/plug&play.svg',
    },
    {
      title: 'HOME.FEATURES.SLIDES.SLIDE_2.TITLE',
      description: 'HOME.FEATURES.SLIDES.SLIDE_2.CONTENT',
      photoUrl: '../../assets/icons/developer.svg',
    },
    {
      title: 'HOME.FEATURES.SLIDES.SLIDE_3.TITLE',
      description: 'HOME.FEATURES.SLIDES.SLIDE_3.CONTENT',
      photoUrl: '../../assets/icons/tested.svg',
    },
    {
      title: 'HOME.FEATURES.SLIDES.SLIDE_4.TITLE',
      description: 'HOME.FEATURES.SLIDES.SLIDE_4.CONTENT',
      photoUrl: '../../assets/icons/customized.svg',
    },
    {
      title: 'HOME.FEATURES.SLIDES.SLIDE_5.TITLE',
      description: 'HOME.FEATURES.SLIDES.SLIDE_5.CONTENT',
      photoUrl: '../../assets/icons/user-centered.svg',
    },
    {
      title: 'HOME.FEATURES.SLIDES.SLIDE_6.TITLE',
      description: 'HOME.FEATURES.SLIDES.SLIDE_6.CONTENT',
      photoUrl: '../../assets/icons/prototyp.svg',
    },
    {
      title: 'HOME.FEATURES.SLIDES.SLIDE_7.TITLE',
      description: 'HOME.FEATURES.SLIDES.SLIDE_7.CONTENT',
      photoUrl: '../../assets/icons/service.svg',
    },
    {
      title: 'HOME.FEATURES.SLIDES.SLIDE_8.TITLE',
      description: 'HOME.FEATURES.SLIDES.SLIDE_8.CONTENT',
      photoUrl: '../../assets/icons/open_source.svg',
    },
  ];
  productHistory = [
    {
      title: 'HOME.HISTORY.PRODUCT.POINT_1.TITLE',
      text: 'HOME.HISTORY.PRODUCT.POINT_1.CONTENT',
      date: 1550181600000,
      isToday: false,
      orderNumber: 0,
    },
    {
      title: 'HOME.HISTORY.PRODUCT.POINT_2.TITLE',
      text: 'HOME.HISTORY.PRODUCT.POINT_2.CONTENT',
      date: 1553724000000,
      isToday: false,
      orderNumber: 1,
    },
    {
      title: 'HOME.HISTORY.PRODUCT.POINT_3.TITLE',
      text: 'HOME.HISTORY.PRODUCT.POINT_3.CONTENT',
      date: 1554066000000,
      isToday: false,
      orderNumber: 2,
    },
    {
      title: 'HOME.HISTORY.PRODUCT.POINT_4.TITLE',
      text: 'HOME.HISTORY.PRODUCT.POINT_4.CONTENT',
      date: 1556658000000,
      isToday: false,
      orderNumber: 3,
    },
    {
      title: 'HOME.HISTORY.PRODUCT.POINT_5.TITLE',
      text: 'HOME.HISTORY.PRODUCT.POINT_5.CONTENT',
      date: 1559336400000,
      isToday: false,
      orderNumber: 4,
    },
  ];

  pathToFile = `./assets/content/i18n/en/home.md`;

  showProductHistory: boolean;
  showSlider: boolean;

  private carouselInterval = 3000;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  durationInSeconds = 5000;

  constructor(private languageService: LanguageService, private customizeService: CustomizeService, private _snackBar: MatSnackBar) {
    if (this.customizeService.currentTheme) {
      this.customizeService.currentTheme.subscribe((theme: Theme) => {
        if (theme.pagesSettings) {
          const homePageSettings = theme.pagesSettings.homePageSettings;

          if (homePageSettings) {
            this.enableSlider(homePageSettings.showSlider);
            this.enableProductHistory(homePageSettings.showProductHistory);
            this.setContactInfo(homePageSettings.contactInfo);
          }
        }
      });
    }
  }

  ngOnInit() {
    const result = browser();
    if (result.name !== 'chrome' && result.name !== 'edge' && result.name !== 'safari' && result.name !== 'firefox') {
      this._snackBar.open(
        `Unfortunately, you are using an outdated browser. Our website may not look quite right in it. Please consider updating your browser to enjoy an optimal experience.`,
        'Close',
        {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: this.durationInSeconds,
        }
      );
    }
    this.languageService.currentLanguage.subscribe((data) => {
      this.pathToFile = `${this.customizeService.currentLanguageFolder}/${data}/home.md`;
    });
  }

  checkTodayDay(date) {
    let isToday = false;
    if (date >= this.today) {
      isToday = true;
    }
    return isToday;
  }

  slider() {
    const images = document.querySelectorAll('#slider .slide');
    const buttons = document.querySelectorAll('.button-block button');
    buttons[0]['style'].backgroundColor = '#D8D8D8';
    let currentImg = 0;
    let carouselIntervalId = null;
    // Show only first slide
    images[currentImg].classList.add('show');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', () => {
        buttons[currentImg]['style'].backgroundColor = null;
        buttons[i]['style'].backgroundColor = '#D8D8D8';
        // Stop autoplay on button click
        clearInterval(carouselIntervalId);
        images[currentImg].classList.remove('show');
        images[i].classList.add('show');
        currentImg = i;
      });
    }

    function nextSlide() {
      images[currentImg].classList.remove('show');
      buttons[currentImg]['style'].backgroundColor = null;
      currentImg++;
      if (currentImg >= images.length) {
        currentImg = 0;
      }
      images[currentImg].classList.add('show');
      buttons[currentImg]['style'].backgroundColor = '#D8D8D8';
    }

    // Start autoplay
    carouselIntervalId = setInterval(nextSlide, this.carouselInterval);
  }

  setProductHistory() {
    if (this.productHistory[this.productHistory.length - 1].date < this.today) {
      this.productHistory.push({
        title: '',
        date: null,
        text: '',
        isToday: true,
        orderNumber: null,
      });
    } else if (this.productHistory[0].date > this.today) {
      this.productHistory.unshift({
        title: '',
        date: null,
        text: '',
        isToday: true,
        orderNumber: null,
      });
    } else {
      for (let i = 0; i < this.productHistory.length - 1; i++) {
        if (this.productHistory[i].date <= this.today && this.productHistory[i + 1].date > this.today) {
          this.productHistory.splice(i + 1, 0, {
            title: '',
            date: null,
            text: '',
            isToday: true,
            orderNumber: null,
          });
          break;
        }
      }
    }
  }

  ngAfterViewInit() {
    if (this.showSlider) {
      this.slider();
    }
  }

  private enableSlider(showSlider: boolean) {
    this.showSlider = !showSlider ? showSlider : true;
  }

  private enableProductHistory(showProductHistory: boolean) {
    this.showProductHistory = !showProductHistory ? showProductHistory : true;

    if (this.productHistory) {
      this.setProductHistory();
    }
  }

  private setContactInfo(contactInfo: ContactInfo) {
    if (contactInfo) {
      this.contactInfo = contactInfo;
    }
  }
}
