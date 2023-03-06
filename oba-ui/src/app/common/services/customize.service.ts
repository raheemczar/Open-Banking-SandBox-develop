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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import cssVars from 'css-vars-ponyfill';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CustomizeService {
  private NEW_THEME_WAS_SET = false;
  private STATUS_WAS_CHANGED = false;
  private IS_CUSTOM = false;
  private DEFAULT_THEME: Theme = {
    globalSettings: {
      logo: 'assets/UI/Logo_XS2ASandbox.png',
    },
  };
  private USER_THEME: Theme = {
    globalSettings: {
      logo: '',
    },
  };

  constructor(private http: HttpClient) {
    this.updateCSS();
  }

  public getJSON(): Observable<Theme> {
    return this.http.get('../assets/UI/defaultTheme.json').pipe(
      map((data) => {
        let theme = data;
        this.IS_CUSTOM = true;
        try {
          JSON.parse(JSON.stringify(theme));
          const errors = this.validateTheme(theme);
          if (errors.length) {
            console.log(errors);
            theme = this.getDefaultTheme();
            this.IS_CUSTOM = false;
          }
        } catch (e) {
          console.log(e);
          theme = this.getDefaultTheme();
          this.IS_CUSTOM = false;
        }
        return theme as Theme;
      }),
      catchError((e) => {
        console.log(e);
        this.IS_CUSTOM = false;
        return this.getDefaultTheme();
      })
    );
  }

  isCustom() {
    return this.IS_CUSTOM;
  }

  getTheme(type?: string): Theme {
    if (type) {
      return this.DEFAULT_THEME;
    } else {
      return this.USER_THEME;
    }
  }

  getDefaultTheme(): Promise<Theme> {
    return this.http
      .get('../assets/UI/defaultTheme.json')
      .toPromise()
      .then((data) => {
        return data as Theme;
      });
  }

  setUserTheme(theme: Theme) {
    this.USER_THEME = theme;
    this.updateCSS(this.USER_THEME.globalSettings.cssVariables);
    if (this.isCustom) {
      this.removeExternalLinkElements();
    }
    if (this.USER_THEME.globalSettings.favicon) {
      this.setFavicon(
        this.USER_THEME.globalSettings.favicon.type,
        this.USER_THEME.globalSettings.favicon.href
      );
    }
    this.NEW_THEME_WAS_SET = true;
    this.STATUS_WAS_CHANGED = !this.STATUS_WAS_CHANGED;
    // this.IS_CUSTOM = true;
  }

  getLogo() {
    if (this.NEW_THEME_WAS_SET) {
      return this.USER_THEME.globalSettings.logo;
    } else {
      return this.DEFAULT_THEME.globalSettings.logo;
    }
  }
  getTitle() {
    if (this.NEW_THEME_WAS_SET) {
      return this.USER_THEME.globalSettings.title;
    } else {
      return this.DEFAULT_THEME.globalSettings.title;
    }
  }

  validateTheme(theme): string[] {
    const general = ['globalSettings'];
    const additional = [['logo']];
    const errors: string[] = [];

    for (let i = 0; i < general.length; i++) {
      if (!theme.hasOwnProperty(general[i])) {
        errors.push(`Missing field ${general[i]}!`);
      } else if (i !== 2) {
        for (const property of additional[i]) {
          if (!theme[general[i]].hasOwnProperty(property)) {
            errors.push(`Field ${general[i]} missing property ${property}!`);
          }
        }
      } else {
        for (const office of theme.officesInfo) {
          for (const property of additional[i]) {
            if (!office.hasOwnProperty(property)) {
              errors.push(`Field ${general[i]} missing property ${property}!`);
            }
          }
        }
      }
    }

    return errors;
  }

  private removeExternalLinkElements(): void {
    const linkElements = document.querySelectorAll('link[rel ~= "icon"]');
    for (const linkElement of Array.from(linkElements)) {
      linkElement.parentNode.removeChild(linkElement);
    }
  }

  public addFavicon(type: string, href: string): void {
    const linkElement = document.createElement('link');
    linkElement.setAttribute('id', 'customize-service-injected-node');
    linkElement.setAttribute('rel', 'icon');
    linkElement.setAttribute('type', type);
    linkElement.setAttribute('href', href);
    document.head.appendChild(linkElement);
  }

  private removeFavicon(): void {
    const linkElement = document.head.querySelector(
      '#customize-service-injected-node'
    );
    if (linkElement) {
      document.head.removeChild(linkElement);
    }
  }

  public setFavicon(type: string, href: string): void {
    this.removeFavicon();
    this.addFavicon(type, href);
  }

  private updateCSS(variables: CSSVariables = {}) {
    // Use css-vars-ponyfill to polyfill css-variables for legacy browser
    cssVars({
      include: 'style',
      onlyLegacy: true,
      watch: true,
      variables,
      onComplete(cssText, styleNode, cssVariables) {
        console.log(cssText, styleNode, cssVariables);
      },
    });
    // If you decide to drop ie11, edge < 14 support in future, use this as implementation to set variables
    // Object.keys(variables).forEach(variableName => {
    //   document.documentElement.style.setProperty('--' + variableName, variables[variableName]);
    // });
  }
}

export interface Theme {
  globalSettings: GlobalSettings;
}

export interface GlobalSettings {
  logo: string;
  title?: string;
  favicon?: Favicon;
  cssVariables?: CSSVariables;
}

export interface Favicon {
  type: string;
  href: string;
}

export interface CSSVariables {
  [key: string]: string;
  colorPrimary?: string;
  fontFamily?: string;
  bodyBG?: string;
  headerBG?: string;
  headerFontColor?: string;
  sidebarBG?: string;
  sidebarFontColor?: string;
  mainBG?: string;
  anchorFontColor?: string;
  anchorFontColorHover?: string;
}
