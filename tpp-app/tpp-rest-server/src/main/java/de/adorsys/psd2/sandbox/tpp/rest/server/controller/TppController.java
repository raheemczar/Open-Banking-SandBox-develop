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

import de.adorsys.ledgers.middleware.api.domain.general.BbanStructure;
import de.adorsys.ledgers.middleware.api.domain.general.RevertRequestTO;
import de.adorsys.ledgers.middleware.api.domain.um.UserTO;
import de.adorsys.ledgers.middleware.client.rest.DataRestClient;
import de.adorsys.ledgers.middleware.client.rest.UserMgmtRestClient;
import de.adorsys.ledgers.middleware.client.rest.UserMgmtStaffRestClient;
import de.adorsys.psd2.sandbox.tpp.cms.api.service.CmsDbNativeService;
import de.adorsys.psd2.sandbox.tpp.rest.api.domain.BankCodeStructure;
import de.adorsys.psd2.sandbox.tpp.rest.api.domain.User;
import de.adorsys.psd2.sandbox.tpp.rest.api.resource.TppRestApi;
import de.adorsys.psd2.sandbox.tpp.rest.server.mapper.UserMapper;
import de.adorsys.psd2.sandbox.tpp.rest.server.service.IbanGenerationService;
import de.adorsys.psd2.sandbox.tpp.rest.server.service.RestExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.iban4j.CountryCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Currency;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.Objects.requireNonNull;
import static org.springframework.http.HttpStatus.ACCEPTED;
import static org.springframework.http.HttpStatus.CREATED;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(TppRestApi.BASE_PATH)
public class TppController implements TppRestApi {
    private final UserMapper userMapper;
    private final UserMgmtStaffRestClient userMgmtStaffRestClient;
    private final UserMgmtRestClient userMgmtRestClient;
    private final DataRestClient dataRestClient;
    private final IbanGenerationService ibanGenerationService;
    private final CmsDbNativeService cmsDbNativeService;
    private final RestExecutionService restExecutionService;

    @Override
    public void login(String login, String pin) {
        //See corresponding Filter
    }

    @Override
    public ResponseEntity<Set<Currency>> getCurrencies() {
        return dataRestClient.currencies();
    }

    @Override
    public ResponseEntity<Map<CountryCode, String>> getSupportedCountryCodes() {
        return ResponseEntity.ok(ibanGenerationService.getCountryCodes());
    }

    @Override
    public ResponseEntity<BankCodeStructure> getBankCodeStructure(String countryCode) {
        return ResponseEntity.ok(ibanGenerationService.getBankCodeStructure(CountryCode.valueOf(countryCode)));

    }

    @Override
    public ResponseEntity<String> getRandomTppId(String countryCode) {
        BankCodeStructure structure = new BankCodeStructure(CountryCode.getByCode(countryCode));
        BbanStructure bbanStructure = new BbanStructure();
        bbanStructure.setCountryPrefix(structure.getCountryCode().name());
        bbanStructure.setLength(structure.getLength());
        bbanStructure.setEntryType(BbanStructure.EntryType.valueOf(structure.getType().name().toUpperCase()));
        return dataRestClient.branchId(bbanStructure);
    }

    @Override
    public ResponseEntity<Void> register(User user) {
        UserTO userTO = userMapper.toUserTO(user);
        userMgmtStaffRestClient.register(user.getId(), userTO);
        return ResponseEntity.status(CREATED).build();
    }

    @Override
    public ResponseEntity<Void> remove() {
        List<String> logins = userMgmtStaffRestClient.getBranchUserLogins().getBody();
        cmsDbNativeService.deleteConsentsByUserIds(logins);
        UserTO user = userMgmtRestClient.getUser().getBody();

        return dataRestClient.branch(requireNonNull(user).getBranch());
    }

    @Override
    public ResponseEntity<Void> transactions(String accountId) {
        return dataRestClient.account(accountId);
    }

    @Override
    public ResponseEntity<Void> account(String accountId) {
        return dataRestClient.depositAccount(accountId);
    }

    @Override
    public ResponseEntity<Void> user(String userId) {
        return dataRestClient.user(userId);
    }

    @Override
    public ResponseEntity<Void> revert(RevertRequestTO revertRequest) {
        restExecutionService.revert(revertRequest);
        return ResponseEntity.status(ACCEPTED).build();
    }

    @Override
    public ResponseEntity<Void> consumeTan(String tan) {
        log.info("\n***\nReceived message from CoreBanking: {} \n***", tan);
        return ResponseEntity.accepted().build();
    }
}
