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

package de.adorsys.ledgers.oba.rest.server.resource;

import de.adorsys.ledgers.keycloak.client.api.KeycloakTokenService;
import de.adorsys.ledgers.middleware.api.domain.account.AccountReferenceTO;
import de.adorsys.ledgers.middleware.api.domain.payment.AmountTO;
import de.adorsys.ledgers.middleware.api.domain.payment.PaymentTO;
import de.adorsys.ledgers.middleware.api.domain.payment.PaymentTargetTO;
import de.adorsys.ledgers.middleware.api.domain.payment.PaymentTypeTO;
import de.adorsys.ledgers.middleware.api.domain.payment.TransactionStatusTO;
import de.adorsys.ledgers.middleware.api.domain.sca.GlobalScaResponseTO;
import de.adorsys.ledgers.middleware.api.domain.sca.OpTypeTO;
import de.adorsys.ledgers.middleware.api.domain.um.AccessTokenTO;
import de.adorsys.ledgers.middleware.api.domain.um.BearerTokenTO;
import de.adorsys.psd2.sandbox.auth.MiddlewareAuthentication;
import de.adorsys.ledgers.oba.service.api.domain.AuthorizeResponse;
import de.adorsys.ledgers.oba.service.api.domain.ConsentReference;
import de.adorsys.ledgers.oba.service.api.domain.ConsentType;
import de.adorsys.ledgers.oba.service.api.domain.PaymentAuthorizeResponse;
import de.adorsys.ledgers.oba.service.api.domain.PaymentWorkflow;
import de.adorsys.ledgers.oba.service.api.domain.exception.ObaErrorCode;
import de.adorsys.ledgers.oba.service.api.domain.exception.ObaException;
import de.adorsys.ledgers.oba.service.api.service.CmsAspspConsentDataService;
import de.adorsys.ledgers.oba.service.api.service.CommonPaymentService;
import de.adorsys.ledgers.oba.service.api.service.ConsentReferencePolicy;
import de.adorsys.psd2.consent.api.pis.CmsCommonPayment;
import de.adorsys.psd2.consent.api.pis.CmsPaymentResponse;
import org.adorsys.ledgers.consent.psu.rest.client.CmsPsuAisClient;
import org.adorsys.ledgers.consent.psu.rest.client.CmsPsuPisClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.internal.util.reflection.FieldSetter;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Currency;
import java.util.HashSet;

import static de.adorsys.ledgers.middleware.api.domain.sca.ScaStatusTO.FINALISED;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class XISControllerServiceTest {
    private static final String PIN = "12345";
    private static final String LOGIN = "anton.brueckner";
    private static final String ENCRYPTED_ID = "ENC_123";
    private static final String AUTH_ID = "AUTH_1";
    private static final String COOKIE = "COOKIE";
    private static final String TOKEN = "TOKEN";
    private static final String OK_URI = "OK_URI";
    private static final String NOK_URI = "NOK_URI";
    private static final String ASPSP_ACC_ID = "ASPSP_ACC_ID";
    private static final String IBAN = "DE123456789";
    private static final Currency EUR = Currency.getInstance("EUR");
    private static final String REDIRECT_ID = "12345";
    private static final LocalDate DATE = LocalDate.of(2020, 1, 24);
    private static final String SEPA = "sepa-credit-transfers";
    private static final String PMT_ID = "PMT_123";

    @InjectMocks
    private XISControllerService service;

    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private ConsentReferencePolicy referencePolicy;
    @Mock
    private ResponseUtils responseUtils;
    @Mock
    private KeycloakTokenService tokenService;
    @Mock
    private CommonPaymentService paymentService;
    @Mock
    private MiddlewareAuthentication middlewareAuth;
    @Mock
    private CmsAspspConsentDataService consentDataService;
    @Mock
    private CmsPsuAisClient cmsPsuAisClient;
    @Mock
    private CmsPsuPisClient cmsPsuPisClient;

    @Test
    void auth() throws NoSuchFieldException {
        // Given
        FieldSetter.setField(service, service.getClass().getDeclaredField("response"), new MockHttpServletResponse());
        FieldSetter.setField(service, service.getClass().getDeclaredField("loginPage"), "www.loginPage.html");

        // When
        ResponseEntity<AuthorizeResponse> result = service.auth(AUTH_ID, ConsentType.AIS, ENCRYPTED_ID, response);

        // Then
        assertEquals(getExpectedAuthResponse(), result);
    }

    @Test
    void resolvePaymentWorkflow() {
        // When
        ResponseEntity<PaymentAuthorizeResponse> result = service.resolvePaymentWorkflow(getPaymentWorkflow());

        // Then
        assertThat(result).isEqualToComparingFieldByFieldRecursively(ResponseEntity.ok(getPaymentAuthorizeResponse()));
    }

    private ConsentReference getConsentReference() {
        ConsentReference ref = new ConsentReference();
        ref.setAuthorizationId(AUTH_ID);
        ref.setConsentType(ConsentType.AIS);
        ref.setEncryptedConsentId(ENCRYPTED_ID);
        ref.setRedirectId(REDIRECT_ID);
        return ref;
    }

    private ResponseEntity<AuthorizeResponse> getExpectedAuthResponse() {
        AuthorizeResponse res = new AuthorizeResponse();
        res.setEncryptedConsentId(ENCRYPTED_ID);
        res.setAuthorisationId(AUTH_ID);
        res.setPsuMessages(Collections.emptyList());
        return ResponseEntity.ok(res);
    }

    private PaymentWorkflow getPaymentWorkflow() {
        PaymentWorkflow workflow = new PaymentWorkflow(getCmsPaymentResponse(), getConsentReference());
        workflow.setAuthResponse(getPaymentAuthorizeResponse());
        workflow.setScaResponse(getScaResponse());
        return workflow;
    }

    private GlobalScaResponseTO getScaResponse() {
        GlobalScaResponseTO to = new GlobalScaResponseTO();
        to.setScaStatus(FINALISED);
        to.setAuthorisationId(AUTH_ID);
        to.setOperationObjectId(PMT_ID);
        to.setBearerToken(getBearerToken());
        to.setMultilevelScaRequired(false);
        return to;
    }

    private BearerTokenTO getBearerToken() {
        return new BearerTokenTO(TOKEN, null, 999, null, getAccessTokenTO(), new HashSet<>());
    }

    private CmsPaymentResponse getCmsPaymentResponse() {
        CmsCommonPayment commonPayment = new CmsCommonPayment(SEPA);
        commonPayment.setPaymentId(PMT_ID);
        return new CmsPaymentResponse(commonPayment, AUTH_ID, OK_URI, NOK_URI);
    }

    private PaymentAuthorizeResponse getPaymentAuthorizeResponse() {
        PaymentAuthorizeResponse resp = new PaymentAuthorizeResponse(getPayment());
        resp.setAuthorisationId(AUTH_ID);
        resp.setScaStatus(FINALISED);
        resp.setAuthorisationId(AUTH_ID);
        resp.setEncryptedConsentId(ENCRYPTED_ID);
        return resp;
    }

    private PaymentTO getPayment() {
        PaymentTO to = new PaymentTO();
        to.setTransactionStatus(TransactionStatusTO.RCVD);
        to.setPaymentProduct(SEPA);
        to.setPaymentType(PaymentTypeTO.SINGLE);
        to.setPaymentId(PMT_ID);
        to.setRequestedExecutionDate(DATE);
        to.setDebtorAccount(new AccountReferenceTO(IBAN, null, null, null, null, EUR));
        to.setAccountId(ASPSP_ACC_ID);
        PaymentTargetTO target = new PaymentTargetTO();
        target.setCreditorAccount(new AccountReferenceTO(IBAN, null, null, null, null, EUR));
        target.setCreditorName("NAME");
        target.setInstructedAmount(new AmountTO(EUR, BigDecimal.TEN));
        target.setEndToEndIdentification("END_TO_END");
        to.setTargets(Collections.singletonList(target));
        return to;
    }

    private AccessTokenTO getAccessTokenTO() {
        AccessTokenTO tokenTO = new AccessTokenTO();
        tokenTO.setLogin(LOGIN);
        return tokenTO;
    }

    @Test
    void selectScaMethod() {
        when(paymentService.selectScaForPayment(any(), any(), any(), any(), any())).thenReturn(getPaymentWorkflow());
        when(middlewareAuth.getBearerToken()).thenReturn(getBearerToken());
        ResponseEntity<PaymentAuthorizeResponse> result = service.selectScaMethod(ENCRYPTED_ID, AUTH_ID, "method");
        verify(responseUtils, times(1)).addAccessTokenHeader(any(), any());
        //More  validation seems senseless
    }

    @Test
    void checkFailedCount() {
        when(consentDataService.isFailedLogin(any())).thenReturn(false);
        assertDoesNotThrow(() -> service.checkFailedCount("id"));
    }

    @Test
    void checkFailedCount_fail() {
        when(consentDataService.isFailedLogin(any())).thenReturn(true);
        assertThrows(ObaException.class, () -> service.checkFailedCount("id"));
    }

    @Test
    void resolveFailedLoginAttempt() {
        when(consentDataService.updateLoginFailedCount(any())).thenReturn(1);

        ObaException obaException = assertThrows(ObaException.class, () -> service.resolveFailedLoginAttempt("id", "id", LOGIN, AUTH_ID, OpTypeTO.CONSENT));
        assertEquals(ObaErrorCode.LOGIN_FAILED, obaException.getObaErrorCode());
        assertEquals("Login Failed!\n You have 1 attempts left", obaException.getDevMessage());
    }

    @Test
    void resolveFailedLoginAttempt_last_use() {
        when(consentDataService.updateLoginFailedCount(any())).thenReturn(0);

        ObaException obaException = assertThrows(ObaException.class, () -> service.resolveFailedLoginAttempt("id", "id", LOGIN, AUTH_ID, OpTypeTO.CONSENT));
        assertEquals(ObaErrorCode.LOGIN_FAILED, obaException.getObaErrorCode());
        assertEquals("Login Failed!\n You've exceeded login attempts limit for current session. Please open new Authorization session", obaException.getDevMessage());
        verify(cmsPsuAisClient, times(1)).updateAuthorisationStatus(any(), any(), any(), any(), any(), any(), any(), any(), any());
    }
}
