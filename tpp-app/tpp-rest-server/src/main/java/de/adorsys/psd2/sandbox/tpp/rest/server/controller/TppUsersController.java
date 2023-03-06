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

package de.adorsys.psd2.sandbox.tpp.rest.server.controller;

import de.adorsys.ledgers.middleware.api.domain.um.UserTO;
import de.adorsys.ledgers.middleware.client.rest.UserMgmtRestClient;
import de.adorsys.ledgers.middleware.client.rest.UserMgmtStaffRestClient;
import de.adorsys.ledgers.util.domain.CustomPageImpl;
import de.adorsys.psd2.sandbox.tpp.rest.api.domain.User;
import de.adorsys.psd2.sandbox.tpp.rest.api.resource.TppUsersRestApi;
import de.adorsys.psd2.sandbox.tpp.rest.server.exception.TppException;
import de.adorsys.psd2.sandbox.tpp.rest.server.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

import static de.adorsys.ledgers.middleware.api.domain.um.UserRoleTO.CUSTOMER;
import static java.util.Collections.singletonList;
import static org.springframework.http.HttpStatus.NO_CONTENT;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequiredArgsConstructor
@RequestMapping(TppUsersRestApi.BASE_PATH)
public class TppUsersController implements TppUsersRestApi {
    private final UserMapper userMapper;
    private final UserMgmtStaffRestClient userMgmtStaffRestClient;
    private final UserMgmtRestClient userMgmtRestClient;

    @Override
    public ResponseEntity<UserTO> createUser(User user) {
        UserTO userTO = userMapper.toUserTO(user);
        return userMgmtStaffRestClient.createUser(userTO);
    }

    @Override
    public ResponseEntity<CustomPageImpl<UserTO>> getAllUsers(String queryParam, int page, int size) {
        CustomPageImpl<UserTO> userPage = Optional.ofNullable(userMgmtStaffRestClient.getBranchUsersByRoles(singletonList(CUSTOMER), queryParam, null, page, size).getBody())
                                              .orElse(new CustomPageImpl<>());
        return ResponseEntity.ok(userPage);
    }

    // TODO resolve 'branch' on Ledgers side
    @Override
    public ResponseEntity<Void> updateUser(User user) {
        if (StringUtils.isBlank(user.getId())) {
            throw new TppException("User id is not present in body!", 400);
        }
        String branch = Optional.ofNullable(userMgmtRestClient.getUser().getBody())
                            .map(UserTO::getBranch)
                            .orElseThrow(() -> new TppException("No tpp code present!", 400));
        UserTO userTO = userMapper.toUserTO(user);
        userTO.setBranch(branch);
        userMgmtStaffRestClient.modifyUser(branch, userTO);
        return new ResponseEntity<>(OK);
    }

    @Override
    public ResponseEntity<UserTO> getUser(String userId) {
        return userMgmtStaffRestClient.getBranchUserById(userId);
    }

    @Override
    public ResponseEntity<UserTO> getSelf() {
        return userMgmtRestClient.getUser();
    }

    @Override
    public ResponseEntity<Boolean> changeStatus(String userId) {
        return userMgmtStaffRestClient.changeStatus(userId);
    }

    @Override
    public ResponseEntity<Void> resetPasswordViaEmail(String login) {
        userMgmtRestClient.resetPasswordViaEmail(login);
        return new ResponseEntity<>(NO_CONTENT);
    }
}
