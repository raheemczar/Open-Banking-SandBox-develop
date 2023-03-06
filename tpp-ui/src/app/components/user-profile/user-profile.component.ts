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

import { User } from '../../models/user.model';
import { TppUserService } from '../../services/tpp.user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TppManagementService } from '../../services/tpp-management.service';
import { CountryService } from '../../services/country.service';
import { PageNavigationService } from '../../services/page-navigation.service';
import { AccountAccess } from '../../models/account-access.model';
import { InfoService } from '../../commons/info/info.service';
import { ResetLedgersService } from '../../services/reset-ledgers.service';
import { RecoveryPoint } from '../../models/recovery-point.models';
import { FormGroup, FormControl } from '@angular/forms';
import { ADMIN_KEY } from '../../commons/constant/constant';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalComponent } from '../modal/modal.component';
import { Select, Store } from '@ngxs/store';
import {
  DeleteRecoveryPoint,
  GetRecoveryPoint,
  RollbackRecoveryPoint,
} from '../actions/revertpoints.action';
import { Observable } from 'rxjs';
import { RecoveryPointState } from '../../state/recoverypoints.state';
import { AuthService } from '../../services/auth.service';
import { TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  @Select(RecoveryPointState.getRecoveryPointsList)
  ngxsrecoveryPoint: Observable<RecoveryPoint[]>;
  public userForm: FormGroup;
  public bsModalRef: BsModalRef;
  admin;
  tppUser: User;
  countries;
  userAmount = 0;
  private newPin = 'pin';
  positionOptions: TooltipPosition[] = [
    'above',
    'before',
    'after',
    'below',
    'left',
    'right',
  ];
  position = new FormControl(this.positionOptions[0]);

  constructor(
    public pageNavigationService: PageNavigationService,
    private countryService: CountryService,
    private userInfoService: TppUserService,
    private tppService: TppManagementService,
    private router: Router,
    private infoService: InfoService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private modal: BsModalService,
    private ledgersService: ResetLedgersService,
    private store: Store,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.admin = sessionStorage.getItem(ADMIN_KEY);
    if (this.admin === false) {
      this.store.dispatch(new GetRecoveryPoint());
    }
    this.setUpCountries();
    this.setUpCurrentUser();
    const tppId = this.route.snapshot.params['id'];
    if (tppId) {
      this.getUserInfo(tppId);
    }
  }

  private setUpCurrentUser() {
    this.userInfoService.currentTppUser.subscribe((user: User) => {
      this.admin = user && user.userRoles.includes('SYSTEM');
      this.tppUser = user;
    });
  }

  private setUpCountries() {
    this.countryService.currentCountries.subscribe((data) => {
      if (data !== null) {
        this.countries = data;
      }
    });
  }

  private getUserInfo(tppId: string) {
    this.tppService.getTppById(tppId).subscribe((user: User) => {
      if (user) {
        this.tppUser = user;
        this.countUsers(this.tppUser.accountAccesses, this.tppUser.id);
      } else {
        this.setUpCurrentUser();
      }
    });
  }

  openConfirmation(content, type: string) {
    this.modalService.open(content).result.then(
      () => {
        if (type === 'block') {
          this.blockTpp();
        } else if (type === 'delete') {
          this.delete();
        } else {
          this.changePin();
        }
      },
      () => {}
    );
  }

  private blockTpp() {
    this.tppService.blockUser(this.tppUser.id).subscribe(() => {
      this.infoService.openFeedback('TPP was successfully blocked!', {
        severity: 'info',
      });
    });
  }

  private delete() {
    if (this.admin) {
      this.tppService.deleteTpp(this.tppUser.id).subscribe(() => {
        this.infoService.openFeedback('TPP was successfully deleted!', {
          severity: 'info',
        });
        this.router.navigateByUrl('/management');
      });
    } else {
      this.tppService.deleteSelf().subscribe(() => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem(
          this.pageNavigationService.getLastVisitedPage()
        );
        this.authService.logout();
        this.router.navigateByUrl('/login');
      });
    }
  }

  private changePin() {
    if (this.newPin && this.newPin !== '') {
      this.tppService.changePin(this.tppUser.id, this.newPin).subscribe(() => {
        this.infoService.openFeedback('TPP PIN was successfully changed!', {
          severity: 'info',
        });
      });
    }
  }

  private countUsers(accountAccesses: AccountAccess[], tppId: string) {
    if (accountAccesses && accountAccesses.length > 0) {
      this.tppService
        .getUsersForTpp(tppId)
        .toPromise()
        .then((users) => {
          let userSet = new Set<string>();
          users.forEach((value) => {
            userSet.add(value.id);
          });
          this.userAmount = userSet.size;
        });
    }
  }

  getRecoveryPoints() {
    if (this.admin === false) {
      this.store.dispatch(new GetRecoveryPoint());
    }
  }

  deleteRecoveryPointById(pointID: string) {
    this.store.dispatch(new DeleteRecoveryPoint(pointID));
    this.infoService.openFeedback('Point successfully deleted');
  }

  rollbackRecoveryPointById(pointID: string) {
    const revertData = {
      branchId: this.tppUser.branch,
      recoveryPointId: pointID,
    };
    this.ledgersService.rollBackPointsById(revertData).subscribe(() => {
      this.getRecoveryPoints();
      this.infoService.openFeedback('Ledgers successfully reverted');
    });
  }

  openModalWithComponent() {
    const initialState = {
      list: ['description'],
      title: 'Create point',
    };
    this.bsModalRef = this.modal.show(ModalComponent, { initialState });
    this.bsModalRef.content.closeBtnName = 'Cancel';
  }

  resetPasswordViaEmail(login: string) {
    this.userInfoService.resetPasswordViaEmail(login).subscribe(() => {
      this.infoService.openFeedback(
        'Link for password reset was sent, check email.',
        {
          severity: 'info',
        }
      );
    });
  }
  handleBackNavigation() {
    window.history.back();
  }
}
