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

package de.adorsys.psd2.sandbox.tpp.rest.server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import de.adorsys.ledgers.middleware.api.domain.account.AccountBalanceTO;
import de.adorsys.ledgers.middleware.api.domain.account.AccountDetailsTO;
import de.adorsys.ledgers.middleware.api.domain.account.AccountReferenceTO;
import de.adorsys.ledgers.middleware.api.domain.general.AddressTO;
import de.adorsys.ledgers.middleware.api.domain.general.RecoveryPointTO;
import de.adorsys.ledgers.middleware.api.domain.general.RevertRequestTO;
import de.adorsys.ledgers.middleware.api.domain.payment.AmountTO;
import de.adorsys.ledgers.middleware.api.domain.payment.PaymentTO;
import de.adorsys.ledgers.middleware.api.domain.payment.PaymentTargetTO;
import de.adorsys.ledgers.middleware.api.domain.um.AccountAccessTO;
import de.adorsys.ledgers.middleware.api.domain.um.ScaUserDataTO;
import de.adorsys.ledgers.middleware.api.domain.um.UserRoleTO;
import de.adorsys.ledgers.middleware.api.domain.um.UserTO;
import de.adorsys.ledgers.middleware.client.mappers.PaymentMapperTO;
import de.adorsys.ledgers.middleware.client.rest.DataRestClient;
import de.adorsys.ledgers.middleware.client.rest.UserMgmtRestClient;
import de.adorsys.ledgers.middleware.client.rest.UserMgmtStaffRestClient;
import de.adorsys.psd2.sandbox.tpp.cms.api.service.CmsDbNativeService;
import de.adorsys.psd2.sandbox.tpp.rest.server.mapper.BalanceMapper;
import de.adorsys.psd2.sandbox.tpp.rest.server.model.AccountBalance;
import de.adorsys.psd2.sandbox.tpp.rest.server.model.DataPayload;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static de.adorsys.ledgers.middleware.api.domain.payment.PaymentTypeTO.SINGLE;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RestExecutionServiceTest {
    private static final String TPP_ID = "DE_12345678";
    private static final String ACCOUNT_ID = "ACCOUNT_ID";
    private static final String USER_IBAN = "DE89000000115555555555";
    private static final String USER_ID = "USER_ID";
    private static final String EMAIL = "EMAIL";
    private static final String LOGIN = "LOGIN";

    @InjectMocks
    private RestExecutionService executionService;
    @Mock
    private DataRestClient dataRestClient;
    @Mock
    private BalanceMapper balanceMapper;
    @Mock
    private PaymentMapperTO paymentTOMapper;
    @Mock
    private UserMgmtStaffRestClient userMgmtStaffRestClient;
    @Mock
    private UserMgmtRestClient userMgmtRestClient;
    @Mock
    private CmsDbNativeService cmsDbNativeService;

    @Test
    void updateLedgers() {
        // Given
        when(paymentTOMapper.getMapper()).thenReturn(new ObjectMapper().registerModule(new JavaTimeModule()));
        when(paymentTOMapper.toAbstractPayment(any(), any(), any())).thenReturn(getPaymentTO());
        when(balanceMapper.toAccountBalanceTO(any())).thenReturn(getAccountBalanceTO());

        // When
        executionService.updateLedgers(getPayload(getSinglePmt()));

        // Then
        verify(balanceMapper, times(1)).toAccountBalanceTO(new AccountBalance());
    }

    @Test
    void revert_ok() {
        // Given
        when(userMgmtStaffRestClient.getBranchUserLogins())
            .thenReturn(ResponseEntity.ok(Arrays.asList(LOGIN)));
        when(dataRestClient.getPoint(anyLong())).thenReturn(ResponseEntity.ok(getPoint()));
        RevertRequestTO revertRequestTO = getRevertRequest();

        // When
        executionService.revert(revertRequestTO);

        // Then
        verify(userMgmtStaffRestClient, times(1)).revertDatabase(revertRequestTO);
    }

    private RecoveryPointTO getPoint() {
        RecoveryPointTO to = new RecoveryPointTO();
        to.setDescription("Descr");
        to.setBranchId(TPP_ID);
        to.setId(1L);
        to.setRollBackTime(LocalDateTime.now());
        return to;
    }

    private AccountBalanceTO getAccountBalanceTO() {
        return new AccountBalanceTO(new AmountTO(), null, LocalDateTime.now(), LocalDate.now(), "lastCommittedTransaction", USER_IBAN);
    }

    private PaymentTO getPaymentTO() {
        PaymentTO paymentTO = new PaymentTO();
        paymentTO.setAccountId(ACCOUNT_ID);
        return paymentTO;
    }

    private DataPayload getPayload(PaymentTO singlePaymentTO) {
        List<UserTO> users = Collections.singletonList(new UserTO("login", "email", "pin"));
        List<AccountDetailsTO> accounts = Collections.singletonList(new AccountDetailsTO());
        List<AccountBalance> balances = Collections.singletonList(new AccountBalance());
        List<PaymentTO> payments = Collections.singletonList(singlePaymentTO);
        return new DataPayload(users, accounts, balances, payments, false, TPP_ID, new HashMap<>());
    }

    private PaymentTO getSinglePmt() {
        PaymentTO payment = new PaymentTO();
        payment.setPaymentType(SINGLE);
        payment.setPaymentProduct("sepa-credit-transfers");
        payment.setRequestedExecutionDate(LocalDate.parse("2019-12-12"));
        payment.setDebtorAccount(new AccountReferenceTO("DE40500105178578796457", null, null, null, null, Currency.getInstance("USD")));
        payment.setTargets(getTargets());
        return payment;
    }

    private List<PaymentTargetTO> getTargets() {
        PaymentTargetTO target = new PaymentTargetTO();
        target.setEndToEndIdentification("WBG-123456789");
        target.setInstructedAmount(new AmountTO(Currency.getInstance("CHF"), new BigDecimal("1.00")));
        target.setCreditorAccount(new AccountReferenceTO("DE40500105178578796457", null, null, null, null, Currency.getInstance("EUR")));
        target.setCreditorAgent("AAAADEBBXXX");
        target.setCreditorAddress(new AddressTO("WBG Straße", "56", "Nürnberg", "90543", "DE", null, null));
        target.setCreditorName("WBG");
        target.setRemittanceInformationUnstructured("Ref. Number WBG-1222");
        ArrayList<PaymentTargetTO> targets = new ArrayList<>();
        targets.add(target);
        return targets;
    }

    private UserTO getUserTO() {
        return new UserTO(USER_ID, LOGIN, EMAIL, "pin", Collections.singletonList(new ScaUserDataTO()), Collections.singletonList(new AccountAccessTO()),
                          Collections.singletonList(UserRoleTO.CUSTOMER), "branch", false, false);
    }

    private RevertRequestTO getRevertRequest() {
        RevertRequestTO revertRequestTO = new RevertRequestTO();
        revertRequestTO.setBranchId("DE-FAKENCA");
        revertRequestTO.setRecoveryPointId(1L);
        return revertRequestTO;
    }
}
