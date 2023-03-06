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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { CustomizeService } from '../../../services/customize.service';
import { ADMIN_KEY } from 'src/app/commons/constant/constant';
import browser from 'browser-detect';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBar,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../auth.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  durationInSeconds = 4;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    public customizeService: CustomizeService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const result = browser();
    if (
      result.name !== 'chrome' &&
      result.name !== 'edge' &&
      result.name !== 'safari' &&
      result.name !== 'firefox'
    ) {
      this._snackBar.open(
        `Unfortunately, you are using an outdated browser. Our website may not look quite right in it. Please consider updating your browser to enjoy an optimal experience.`,
        'Close',
        {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: this.durationInSeconds * 1000,
        }
      );
    }
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      pin: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter your credentials';
      return;
    }

    this.authService.login(this.loginForm.value).subscribe(
      (success) => {
        if (success) {
          this.navigateOnLogin();
        }
      },
      (data) => {
        if (data.status === 401) {
          this.errorMessage = 'Invalid credentials';
        }
      }
    );
  }

  navigateOnLogin() {
    if (sessionStorage.getItem(ADMIN_KEY) === 'true') {
      this.router.navigate(['/management']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
