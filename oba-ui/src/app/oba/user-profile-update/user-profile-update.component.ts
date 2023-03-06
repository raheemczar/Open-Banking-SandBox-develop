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
import { OnlineBankingService } from '../../common/services/online-banking.service';
import { Router } from '@angular/router';
import { UserTO } from '../../api/models/user-to';
import { InfoService } from '../../common/info/info.service';
import { CurrentUserService } from '../../common/services/current-user.service';
import { ShareDataService } from '../../common/services/share-data.service';
import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-user-profile-edit',
  templateUrl: './user-profile-update.component.html',
  styleUrls: ['./user-profile-update.component.scss'],
})
export class UserProfileUpdateComponent implements OnInit {
  public obaUser: UserTO;
  public submitted: boolean;
  public userForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private currentUserService: CurrentUserService,
    private onlineBankingService: OnlineBankingService,
    private shareDataService: ShareDataService,
    private currentUser: CurrentUserService,
    private infoService: InfoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.setDefaultUserDetails();
    this.setUpEditedUserFormControl();
  }

  get formControl() {
    return this.userForm.controls;
  }

  public onSubmit() {
    this.submitted = false;

    if (this.userForm.invalid) {
      return;
    }
    const updatedUser: UserTO = {
      ...this.obaUser,
      login: this.userForm.get('username').value,
      email: this.userForm.get('email').value,
    };
    this.currentUser
      .updateUserDetails(updatedUser)
      .subscribe(() => this.setDefaultUserDetails());
    this.shareDataService.updateUserDetails(updatedUser);
    this.infoService.openFeedback('User details was successfully updated!', {
      severity: 'info',
    });
    this.router.navigate(['/accounts']);
    console.log('updatedUser', updatedUser);
  }

  setUpEditedUserFormControl(): void {
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
    });
  }

  setDefaultUserDetails() {
    this.currentUserService.getCurrentUser().subscribe((data) => {
      console.log('data', data);
      this.obaUser = data.body;
      this.userForm.setValue({
        username: this.obaUser.login,
        email: this.obaUser.email,
      });
    });
  }

  resetPasswordViaEmail(login: string) {
    this.authService.resetPasswordViaEmail(login).subscribe(() => {
      this.infoService.openFeedback(
        'Link for password reset was sent, check email.',
        {
          severity: 'info',
        }
      );
    });
  }
}
