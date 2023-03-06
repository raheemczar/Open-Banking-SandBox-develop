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

package de.adorsys.ledgers.oba.service.impl.service;

import de.adorsys.ledgers.middleware.api.domain.account.AccountDetailsTO;
import de.adorsys.ledgers.middleware.api.domain.account.AccountStatusTO;
import de.adorsys.ledgers.middleware.api.domain.account.AccountTypeTO;
import de.adorsys.ledgers.middleware.api.domain.account.UsageTypeTO;
import de.adorsys.ledgers.middleware.api.domain.sca.GlobalScaResponseTO;
import de.adorsys.ledgers.middleware.api.domain.sca.ScaStatusTO;
import de.adorsys.ledgers.middleware.api.domain.um.AccessTokenTO;
import de.adorsys.ledgers.middleware.api.domain.um.AisAccountAccessInfoTO;
import de.adorsys.ledgers.middleware.api.domain.um.AisConsentTO;
import de.adorsys.ledgers.middleware.api.domain.um.BearerTokenTO;
import de.adorsys.ledgers.middleware.client.rest.AuthRequestInterceptor;
import de.adorsys.ledgers.middleware.client.rest.OperationInitiationRestClient;
import de.adorsys.ledgers.middleware.client.rest.RedirectScaRestClient;
import de.adorsys.ledgers.oba.service.api.domain.ConsentAuthorizeResponse;
import de.adorsys.ledgers.oba.service.api.domain.ConsentReference;
import de.adorsys.ledgers.oba.service.api.domain.ConsentType;
import de.adorsys.ledgers.oba.service.api.domain.ConsentWorkflow;
import de.adorsys.ledgers.oba.service.api.domain.exception.ObaException;
import de.adorsys.ledgers.oba.service.api.service.CmsAspspConsentDataService;
import de.adorsys.ledgers.oba.service.api.service.ConsentReferencePolicy;
import de.adorsys.ledgers.oba.service.impl.mapper.ObaAisConsentMapper;
import de.adorsys.psd2.consent.api.CmsAspspConsentDataBase64;
import de.adorsys.psd2.consent.api.ais.AisAccountAccess;
import de.adorsys.psd2.consent.api.ais.CmsAisAccountConsent;
import de.adorsys.psd2.consent.api.ais.CmsAisConsentResponse;
import de.adorsys.psd2.xs2a.core.authorisation.AuthorisationTemplate;
import de.adorsys.psd2.xs2a.core.consent.AisConsentRequestType;
import de.adorsys.psd2.xs2a.core.consent.ConsentStatus;
import de.adorsys.psd2.xs2a.core.profile.AccountReference;
import de.adorsys.psd2.xs2a.core.tpp.TppInfo;
import org.adorsys.ledgers.consent.psu.rest.client.CmsPsuAisClient;
import org.adorsys.ledgers.consent.xs2a.rest.client.AspspConsentDataClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Currency;
import java.util.HashSet;
import java.util.List;

import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RedirectConsentServiceImplTest {
    private static final String SCA_METHOD_ID = "scaMethodId";
    private static final String AUTHORIZATION_ID = "authorizationID";
    private static final String ENCRYPTED_CONSENT_ID = "encryptedConsentId";
    private static final String REDIRECT_ID = "redirectID";
    private static final String CONSENT_ID = "234234kjlkjklj2lk34j";
    private static final String IBAN_DE = "DE1234567890";
    private static final String IBAN_FR = "FR1234567890";
    private static final Currency EUR = Currency.getInstance("EUR");
    private static final String USER_LOGIN = "login";
    private static final String USER_ID = "userId";

    @InjectMocks
    private RedirectConsentServiceImpl redirectConsentService;
    @Mock
    private CmsPsuAisClient cmsPsuAisClient;
    @Mock
    private OperationInitiationRestClient operationInitiationRestClient;
    @Mock
    private AuthRequestInterceptor authInterceptor;
    @Mock
    private ObaAisConsentMapper consentMapper;
    @Mock
    private ConsentReferencePolicy referencePolicy;
    @Mock
    private AspspConsentDataClient aspspConsentDataClient;
    @Mock
    private CmsAspspConsentDataService dataService;
    @Mock
    private RedirectScaRestClient redirectScaClient;

    @Test
    void selectScaMethod() {
        // Given
        when(redirectScaClient.startSca(any())).thenReturn(ResponseEntity.ok(getGlobalResponse()));
        when(redirectScaClient.selectMethod(any(), any())).thenReturn(ResponseEntity.ok(getGlobalResponse()));

        // When
        redirectConsentService.selectScaMethod(SCA_METHOD_ID, null, getConsentWorkflow(AisConsentRequestType.GLOBAL, IBAN_DE));

        // Then
        verify(redirectScaClient, times(1)).selectMethod(AUTHORIZATION_ID, SCA_METHOD_ID);
    }

    @Test
    void updateAccessByConsentType_globalConsent() {
        assertThatCode(() -> redirectConsentService.updateAccessByConsentType(getConsentWorkflow(AisConsentRequestType.GLOBAL, IBAN_DE), singletonList(getAccountDetails()))).doesNotThrowAnyException();
    }

    @Test
    void updateAccessByConsentType_allAvailableAccountsConsent() {
        assertThatCode(() -> redirectConsentService.updateAccessByConsentType(getConsentWorkflow(AisConsentRequestType.ALL_AVAILABLE_ACCOUNTS, IBAN_DE), singletonList(getAccountDetails()))).doesNotThrowAnyException();
    }

    @Test
    void updateAccessByConsentType_dedicatedAccountsConsent() {
        assertThatCode(() -> redirectConsentService.updateAccessByConsentType(getConsentWorkflow(AisConsentRequestType.DEDICATED_ACCOUNTS, IBAN_DE), singletonList(getAccountDetails()))).doesNotThrowAnyException();
    }

    @Test
    void updateAccessByConsentType_loginFailed() {
        ConsentWorkflow workflow = getConsentWorkflow(AisConsentRequestType.DEDICATED_ACCOUNTS, IBAN_FR);
        List<AccountDetailsTO> details = List.of(getAccountDetails());
        // When
        assertThrows(ObaException.class, () -> redirectConsentService.updateAccessByConsentType(workflow, details));
    }

    @Test
    void updateScaStatusConsentStatusConsentData() throws IOException {
        // Given
        when(cmsPsuAisClient.updateAuthorisationStatus(any(), any(), any(), any(), any(), any(), any(), any(), any())).thenReturn(ResponseEntity.ok().build());
        when(dataService.toBase64String(any())).thenReturn(CONSENT_ID);
        when(aspspConsentDataClient.updateAspspConsentData(any(), any())).thenReturn(ResponseEntity.ok().build());

        // When
        redirectConsentService.updateScaStatusAndConsentData(USER_ID, getConsentWorkflow(AisConsentRequestType.DEDICATED_ACCOUNTS, IBAN_DE));

        // Then
        verify(aspspConsentDataClient, times(1)).updateAspspConsentData(ENCRYPTED_CONSENT_ID, new CmsAspspConsentDataBase64(CONSENT_ID, CONSENT_ID));
    }

    @Test
    void startConsent() {
        // Given
        AisConsentTO aisConsentTO = getAisConsentTO();
        when(consentMapper.accountAccess(any(), any())).thenReturn(getAisAccountAccess(IBAN_DE));
        when(cmsPsuAisClient.putAccountAccessInConsent(any(), any(), any())).thenReturn(ResponseEntity.ok().build());
        when(consentMapper.toTo(any())).thenReturn(aisConsentTO);
        when(operationInitiationRestClient.initiateAisConsent(aisConsentTO)).thenReturn(ResponseEntity.ok(getGlobalScaResponseTO()));

        // When
        redirectConsentService.startConsent(getConsentWorkflow(AisConsentRequestType.DEDICATED_ACCOUNTS, IBAN_DE), aisConsentTO, singletonList(getAccountDetails()));

        // Then
        verify(consentMapper, times(1)).toTo(getCmsAisAccountConsent(AisConsentRequestType.DEDICATED_ACCOUNTS, IBAN_DE));
    }

    @Test
    void identifyConsent() {
        // Given
        when(referencePolicy.fromRequest(any(), any())).thenReturn(getConsentReference());
        when(cmsPsuAisClient.getConsentIdByRedirectId(any(), any())).thenReturn(ResponseEntity.ok(getCmsAisConsentResponse(AisConsentRequestType.DEDICATED_ACCOUNTS, IBAN_DE)));
        when(consentMapper.toTo(any())).thenReturn(getAisConsentTO());
        when(dataService.mapToGlobalResponse(any(), any())).thenReturn(getSCAResponseTO());

        // When
        ConsentWorkflow workflow = redirectConsentService.identifyConsent(ENCRYPTED_CONSENT_ID, AUTHORIZATION_ID, getBearerTokenTO());

        // Then
        assertNotNull(workflow);
        assertEquals(workflow.getConsentReference(), getConsentReference());
        assertNotNull(workflow.getScaResponse().getBearerToken());
    }

    @Test
    void identifyConsent_bearerTokenNull() {
        // Given
        when(referencePolicy.fromRequest(any(), any())).thenReturn(getConsentReference());
        when(cmsPsuAisClient.getConsentIdByRedirectId(any(), any())).thenReturn(ResponseEntity.ok(getCmsAisConsentResponse(AisConsentRequestType.DEDICATED_ACCOUNTS, IBAN_DE)));
        when(consentMapper.toTo(any())).thenReturn(getAisConsentTO());

        // When
        ConsentWorkflow workflow = redirectConsentService.identifyConsent(ENCRYPTED_CONSENT_ID, AUTHORIZATION_ID, null);

        // Then
        assertNotNull(workflow);
        assertEquals(workflow.getConsentReference(), getConsentReference());
    }

    private static AccountDetailsTO getAccountDetails() {
        AccountDetailsTO details = new AccountDetailsTO();
        details.setId(USER_ID);
        details.setIban(IBAN_DE);
        details.setCurrency(Currency.getInstance("EUR"));
        details.setName(USER_LOGIN);
        details.setAccountType(AccountTypeTO.CASH);
        details.setAccountStatus(AccountStatusTO.ENABLED);
        details.setUsageType(UsageTypeTO.PRIV);
        return details;
    }

    private ConsentWorkflow getConsentWorkflow(AisConsentRequestType type, String iban) {
        ConsentWorkflow workflow = new ConsentWorkflow(getCmsAisConsentResponse(type, iban), getConsentReference());
        workflow.setScaResponse(getSCAResponseTO());
        workflow.setAuthResponse(getConsentAuthorizeResponse());
        return workflow;
    }

    private ConsentAuthorizeResponse getConsentAuthorizeResponse() {
        ConsentAuthorizeResponse response = new ConsentAuthorizeResponse();
        response.setAccounts(singletonList(getAccountDetails()));
        response.setConsent(getAisConsentTO());
        response.setScaStatus(ScaStatusTO.FINALISED);
        return response;
    }

    private AisConsentTO getAisConsentTO() {
        return new AisConsentTO("id", "userId", "tppId", 6, new AisAccountAccessInfoTO(), LocalDate.now(), false);
    }

    private GlobalScaResponseTO getSCAResponseTO() {
        GlobalScaResponseTO response = new GlobalScaResponseTO();
        response.setScaStatus(ScaStatusTO.FINALISED);
        response.setAuthorisationId(AUTHORIZATION_ID);
        response.setBearerToken(getBearerTokenTO());
        //response.setOpType();
        return response;
        //ScaStatusTO.FINALISED, AUTHORIZATION_ID, Collections.EMPTY_LIST, new ScaUserDataTO(), new ChallengeDataTO(), "psuMessage", LocalDateTime.now(), 15, false, "authConfirmationCode", getBearerTokenTO(), "objectType"
    }

    private BearerTokenTO getBearerTokenTO() {
        return new BearerTokenTO("access_token", "Bearer", 60, "refresh_token", new AccessTokenTO(), new HashSet<>());
    }

    private CmsAisConsentResponse getCmsAisConsentResponse(AisConsentRequestType type, String iban) {
        return new CmsAisConsentResponse(getCmsAisAccountConsent(type, iban), AUTHORIZATION_ID, "tppOkRedirectUri", "tppNokRedirectUri");
    }

    private CmsAisAccountConsent getCmsAisAccountConsent(AisConsentRequestType type, String iban) {
        return new CmsAisAccountConsent(CONSENT_ID, getAisAccountAccess(iban), false, LocalDate.now().plusMonths(1), LocalDate.now().plusMonths(1), 3, LocalDate.now(), ConsentStatus.VALID, false, false,
                                        type, Collections.emptyList(), new TppInfo(), new AuthorisationTemplate(), false, Collections.emptyList(),
                                        Collections.emptyMap(), OffsetDateTime.MIN, OffsetDateTime.MIN, null, null);
    }

    private AisAccountAccess getAisAccountAccess(String iban) {
        return new AisAccountAccess(singletonList(getReference(iban)), Collections.emptyList(), Collections.emptyList(), "availableAccounts", "allPsd2", "availableAccountsWithBalance", null);
    }

    private AccountReference getReference(String iban) {
        AccountReference reference = new AccountReference();
        reference.setIban(iban);
        reference.setCurrency(EUR);
        return reference;
    }

    ConsentReference getConsentReference() {
        ConsentReference reference = new ConsentReference();
        reference.setAuthorizationId(AUTHORIZATION_ID);
        reference.setConsentType(ConsentType.AIS);
        reference.setEncryptedConsentId(ENCRYPTED_CONSENT_ID);
        reference.setRedirectId(REDIRECT_ID);
        return reference;
    }

    private GlobalScaResponseTO getGlobalScaResponseTO() {
        GlobalScaResponseTO response = new GlobalScaResponseTO();
        response.setOperationObjectId(CONSENT_ID);
        response.setAuthorisationId(AUTHORIZATION_ID);
        response.setScaStatus(ScaStatusTO.FINALISED);
        response.setScaMethods(Collections.emptyList());
        response.setAuthConfirmationCode("code");
        response.setPsuMessage("psuMessage");
        return response;
    }

    private GlobalScaResponseTO getGlobalResponse() {
        GlobalScaResponseTO response = new GlobalScaResponseTO();
        response.setOperationObjectId(CONSENT_ID);
        response.setAuthorisationId(AUTHORIZATION_ID);
        response.setScaStatus(ScaStatusTO.FINALISED);
        response.setScaMethods(Collections.emptyList());
        response.setAuthConfirmationCode("code");
        response.setPsuMessage("psuMessage");
        return response;
    }
}
