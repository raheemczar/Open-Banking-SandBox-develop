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

package de.adorsys.psd2.sandbox.tpp.rest.server.mapper;

import de.adorsys.ledgers.middleware.api.domain.account.AccountBalanceTO;
import de.adorsys.ledgers.middleware.api.domain.account.AccountDetailsTO;
import de.adorsys.ledgers.middleware.api.domain.account.AccountReportTO;
import de.adorsys.ledgers.middleware.api.domain.account.UsageTypeTO;
import de.adorsys.ledgers.middleware.api.domain.payment.AmountTO;
import de.adorsys.ledgers.middleware.api.domain.um.AccessTypeTO;
import de.adorsys.ledgers.middleware.api.domain.um.AccountAccessTO;
import de.adorsys.ledgers.middleware.api.domain.um.UserTO;
import de.adorsys.psd2.sandbox.tpp.rest.api.domain.*;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.Currency;

import static de.adorsys.ledgers.middleware.api.domain.account.AccountStatusTO.ENABLED;
import static de.adorsys.ledgers.middleware.api.domain.account.AccountTypeTO.CASH;
import static de.adorsys.ledgers.middleware.api.domain.account.BalanceTypeTO.INTERIM_AVAILABLE;
import static de.adorsys.psd2.sandbox.tpp.rest.api.domain.AccessType.OWNER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

class AccountMapperTest {
    private static final String IBAN = "DE1234567890";
    private static final AccessTypeTO ACCESS_TYPE = AccessTypeTO.OWNER;
    private static final int SCA_WEIGHT = 20;
    private static final Currency CURRENCY = Currency.getInstance("EUR");

    private final AccountMapper accountMapper = Mappers.getMapper(AccountMapper.class);

    @Test
    void toAccountDetailsTOTest() {
        // Given
        DepositAccount input = getTppUiDepositAccount();
        AccountDetailsTO expectedResult = getAccountDetailsTO();

        // When
        AccountDetailsTO result = accountMapper.toAccountDetailsTO(input);

        // Then
        assertEquals(expectedResult, result);
    }

    @Test
    void toAccountAccessTOTest() {
        // Given
        AccountAccess input = getTppUiAccountAccess();
        AccountAccessTO expectedResult = getAccountAccessTO();

        // When
        AccountAccessTO result = accountMapper.toAccountAccessTO(input);

        // Then
        assertEquals(expectedResult, result);
    }

    @Test
    void toAccountReport() {
        // Given
        AccountReport expected = new AccountReport(getDetails(), Arrays.asList(new UserAccess("LOGIN1", SCA_WEIGHT, OWNER), new UserAccess("LOGIN2", SCA_WEIGHT, OWNER)), false);

        // When
        AccountReport result = accountMapper.toAccountReport(getReportTO());

        // Then
        assertThat(result).isEqualToComparingFieldByFieldRecursively(expected);
    }

    private AccountReportTO getReportTO() {
        return new AccountReportTO(getDetails(), Arrays.asList(getUser("LOGIN1"), getUser("LOGIN2")), false);
    }

    private UserTO getUser(String login) {
        UserTO user = new UserTO();
        user.setLogin(login);
        user.setAccountAccesses(Collections.singletonList(new AccountAccessTO("id", IBAN, CURRENCY, ACCESS_TYPE, SCA_WEIGHT, "accountId")));
        return user;
    }

    @NotNull
    private AccountDetailsTO getDetails() {
        AccountDetailsTO details = new AccountDetailsTO();
        details.setIban(IBAN);
        details.setAccountStatus(ENABLED);
        details.setAccountType(CASH);
        details.setBalances(Collections.singletonList(new AccountBalanceTO(new AmountTO(CURRENCY, BigDecimal.TEN), INTERIM_AVAILABLE, null, null, null, null)));
        details.setCurrency(CURRENCY);
        return details;
    }

    private AccountDetailsTO getAccountDetailsTO() {
        return new AccountDetailsTO(null, IBAN, null, null, null, null, CURRENCY, null, null, CASH, ENABLED, null, null, UsageTypeTO.PRIV, null, null, false, false, BigDecimal.ZERO, null);
    }

    private DepositAccount getTppUiDepositAccount() {
        DepositAccount depositAccount = new DepositAccount();
        depositAccount.setId("XYZ");
        depositAccount.setAccountStatus(AccountStatus.ENABLED);
        depositAccount.setAccountType(AccountType.CASH);
        depositAccount.setCurrency(CURRENCY);
        depositAccount.setIban(IBAN);
        depositAccount.setUsageType(AccountUsage.PRIV);
        return depositAccount;
    }

    private AccountAccessTO getAccountAccessTO() {
        return new AccountAccessTO(null, IBAN, CURRENCY, ACCESS_TYPE, SCA_WEIGHT, null);
    }

    private AccountAccess getTppUiAccountAccess() {
        AccountAccess accountAccess = new AccountAccess();
        accountAccess.setId("XyZ");
        accountAccess.setAccessType(ACCESS_TYPE);
        accountAccess.setIban(IBAN);
        accountAccess.setCurrency(CURRENCY);
        accountAccess.setScaWeight(SCA_WEIGHT);
        return accountAccess;
    }

}
