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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.adorsys.ledgers.middleware.api.domain.sca.GlobalScaResponseTO;
import de.adorsys.ledgers.middleware.api.domain.sca.SCAConsentResponseTO;
import de.adorsys.ledgers.middleware.api.domain.sca.SCAResponseTO;
import de.adorsys.ledgers.middleware.api.domain.um.AisAccountAccessInfoTO;
import de.adorsys.ledgers.middleware.api.domain.um.AisConsentTO;
import de.adorsys.ledgers.middleware.client.rest.AuthRequestInterceptor;
import de.adorsys.ledgers.middleware.client.rest.ConsentRestClient;
import de.adorsys.ledgers.middleware.client.rest.RedirectScaRestClient;
import de.adorsys.ledgers.oba.service.api.domain.CreatePiisConsentRequestTO;
import de.adorsys.ledgers.oba.service.api.domain.ObaAisConsent;
import de.adorsys.ledgers.oba.service.api.domain.exception.ObaErrorCode;
import de.adorsys.ledgers.oba.service.api.domain.exception.ObaException;
import de.adorsys.ledgers.oba.service.api.service.ConsentService;
import de.adorsys.ledgers.oba.service.impl.mapper.CreatePiisConsentRequestMapper;
import de.adorsys.ledgers.util.domain.CustomPageImpl;
import de.adorsys.psd2.consent.api.AspspDataService;
import de.adorsys.psd2.consent.api.CmsAspspConsentDataBase64;
import de.adorsys.psd2.consent.api.CmsPageInfo;
import de.adorsys.psd2.consent.api.ResponseData;
import de.adorsys.psd2.consent.api.ais.CmsAisAccountConsent;
import de.adorsys.psd2.consent.aspsp.api.piis.CreatePiisConsentRequest;
import de.adorsys.psd2.consent.aspsp.api.piis.CreatePiisConsentResponse;
import de.adorsys.psd2.consent.service.security.SecurityDataService;
import de.adorsys.psd2.xs2a.core.consent.AspspConsentData;
import de.adorsys.psd2.xs2a.core.sca.AuthenticationDataHolder;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.adorsys.ledgers.consent.aspsp.rest.client.CmsAspspAisClient;
import org.adorsys.ledgers.consent.aspsp.rest.client.CmsAspspPiisClient;
import org.adorsys.ledgers.consent.psu.rest.client.CmsPsuAisClient;
import org.adorsys.ledgers.consent.xs2a.rest.client.AspspConsentDataClient;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static de.adorsys.ledgers.oba.service.api.domain.exception.ObaErrorCode.*;
import static java.lang.String.format;
import static java.util.Base64.getEncoder;
import static java.util.Objects.requireNonNull;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsentServiceImpl implements ConsentService {
    private static final String RESPONSE_ERROR = "Error in response from CMS, please contact admin.";
    private static final String GET_CONSENTS_ERROR_MSG = "Failed to retrieve consents for user: %s, code: %s, message: %s";
    private static final String CONSENT_COULD_NOT_BE_FOUND = "Consent %s could not be found";
    private static final String FAILED_TO_CONFIRM_THE_CONSENT_MSG = "Failed to confirm the consent %s msg: %s";
    private static final String UPDATE_FAILED_MSG = "Update %s failed msg: %s";
    private static final String COULD_NOT_RETRIEVE_ASPSP_CONSENT_DATA = "Could not retrieve ASPSP consent data.";
    private static final String DEFAULT_SERVICE_INSTANCE_ID = "UNDEFINED";

    private final CmsPsuAisClient cmsPsuAisClient;
    private final CmsAspspAisClient cmsAspspAisClient;
    private final CmsAspspPiisClient cmsAspspPiisClient;
    private final AspspConsentDataClient consentDataClient;
    private final SecurityDataService securityDataService;
    private final ConsentRestClient consentRestClient;
    private final AuthRequestInterceptor authInterceptor;
    private final ObjectMapper objectMapper;
    private final AspspDataService aspspDataService;
    private final CreatePiisConsentRequestMapper createPiisConsentRequestMapper;
    private final RedirectScaRestClient redirectScaRestClient;

    @Override
    public List<ObaAisConsent> getListOfConsents(String userLogin) {
        try {
            List<CmsAisAccountConsent> aisAccountConsents = Optional.ofNullable(
                cmsPsuAisClient.getConsentsForPsu(userLogin, null, null, null, DEFAULT_SERVICE_INSTANCE_ID, null, null,
                                                  null, 0, 9999).getBody())
                                                                .orElse(Collections.emptyList());
            return toObaAisConsent(aisAccountConsents);
        } catch (FeignException e) {
            String msg = format(GET_CONSENTS_ERROR_MSG, userLogin, e.status(), e.getMessage());
            log.error(msg);
            throw ObaException.builder()
                      .devMessage(RESPONSE_ERROR)
                      .obaErrorCode(AIS_BAD_REQUEST).build();
        }
    }

    @Override
    public CustomPageImpl<ObaAisConsent> getListOfConsentsPaged(String userLogin, int page, int size) {
        try {
            ResponseData<Collection<CmsAisAccountConsent>> responseData = cmsAspspAisClient.getConsentsByPsu(null, null, userLogin, null, null, null, DEFAULT_SERVICE_INSTANCE_ID, page, size, null);
            return toCustomPage(responseData, this::toObaAisConsent);
        } catch (FeignException e) {
            String msg = format(GET_CONSENTS_ERROR_MSG, userLogin, e.status(), e.getMessage());
            log.error(msg);
            throw ObaException.builder()
                      .devMessage(RESPONSE_ERROR)
                      .obaErrorCode(AIS_BAD_REQUEST).build();
        }
    }

    private <S, R> CustomPageImpl<R> toCustomPage(ResponseData<Collection<S>> responseData, Function<Collection<S>, List<R>> mapper) {
        CmsPageInfo pageInfo = responseData.getPageInfo();
        int totalPages = (int) Math.ceil((double) pageInfo.getTotal() / pageInfo.getItemsPerPage());
        return new CustomPageImpl<>(
            (int) pageInfo.getPageIndex(),
            (int) pageInfo.getItemsPerPage(),
            totalPages,
            responseData.getData().size(),
            pageInfo.getTotal(),
            pageInfo.getPageIndex() > 0,
            pageInfo.getPageIndex() == 0,
            totalPages > pageInfo.getPageIndex() + 1,
            totalPages == pageInfo.getPageIndex() + 1,
            mapper.apply(responseData.getData())
        );
    }

    @Override
    public boolean revokeConsent(String consentId) {
        return Optional.ofNullable(cmsPsuAisClient.revokeConsent(consentId, DEFAULT_SERVICE_INSTANCE_ID).getBody())
                   .orElse(false);
    }

    @Override
    public void confirmAisConsentDecoupled(String userLogin, String encryptedConsentId, String authorizationId, String tan) {
        String consentId = getDecryptedConsentId(encryptedConsentId);
        setActiveAccessTokenFromConsentData(encryptedConsentId);

        SCAConsentResponseTO ledgerValidateTanConsentResponse = authorizeConsentAtLedgers(authorizationId, tan);
        confirmConsentAtCms(consentId);
        updateCmsAuthorization(userLogin, authorizationId, consentId);
        updateAspspConsentDataForConsent(encryptedConsentId, ledgerValidateTanConsentResponse);
        authInterceptor.setAccessToken(null);
    }

    @Override
    public void createPiisConsent(CreatePiisConsentRequestTO request, String psuId) {
        //Create piis at Cms
        CreatePiisConsentRequest piisConsentRequest = createPiisConsentRequestMapper.fromCreatePiisConsentRequest(request);
        CreatePiisConsentResponse cmsConsent = cmsAspspPiisClient.createConsent(piisConsentRequest, psuId, null, null, null, DEFAULT_SERVICE_INSTANCE_ID).getBody();

        //Create piis at Ledgers
        String consentId = Optional.ofNullable(cmsConsent).orElseGet(() -> new CreatePiisConsentResponse(null)).getConsentId();
        AisConsentTO pisConsent = new AisConsentTO(consentId, psuId, piisConsentRequest.getTppAuthorisationNumber(), 100, buildAccountAccess(piisConsentRequest.getAccount().getIban()), piisConsentRequest.getValidUntil(), true);
        SCAConsentResponseTO ledgersCreateConsentResponse = consentRestClient.initiatePiisConsent(pisConsent).getBody();
        //Update Aspsp consent data at CMS
        updateAspspConsentDataForConsent(consentId, ledgersCreateConsentResponse);
    }

    private AisAccountAccessInfoTO buildAccountAccess(String iban) {
        AisAccountAccessInfoTO access = new AisAccountAccessInfoTO();
        access.setAccounts(Collections.singletonList(iban));
        return access;
    }

    private void updateCmsAuthorization(String userLogin, String authorizationId, String consentId) {
        try {
            cmsPsuAisClient.updateAuthorisationStatus(consentId, "FINALISED", authorizationId, userLogin, null, null, null, DEFAULT_SERVICE_INSTANCE_ID, new AuthenticationDataHolder(null, null));
        } catch (FeignException e) {
            String msg = format(UPDATE_FAILED_MSG, "authorization", e.getMessage());
            log.error(msg);
            throw ObaException.builder()
                      .devMessage(msg)
                      .obaErrorCode(AIS_BAD_REQUEST)
                      .build();
        }
    }

    private void updateAspspConsentDataForConsent(String encryptedConsentId, SCAConsentResponseTO ledgerValidateTanConsentResponse) {
        CmsAspspConsentDataBase64 updatedConsentData = new CmsAspspConsentDataBase64(encryptedConsentId, writeScaResponseAsString(ledgerValidateTanConsentResponse));
        try {
            consentDataClient.updateAspspConsentData(encryptedConsentId, updatedConsentData);
        } catch (FeignException e) {
            String msg = format(UPDATE_FAILED_MSG, "aspsp consent data", e.getMessage());
            log.error(msg);
            throw ObaException.builder()
                      .devMessage(msg)
                      .obaErrorCode(AIS_BAD_REQUEST)
                      .build();
        }
    }

    private void confirmConsentAtCms(String consentId) {
        try {
            cmsPsuAisClient.confirmConsent(consentId, DEFAULT_SERVICE_INSTANCE_ID);
        } catch (FeignException e) {
            String msg = e.status() == 404
                             ? format(CONSENT_COULD_NOT_BE_FOUND, consentId)
                             : format(FAILED_TO_CONFIRM_THE_CONSENT_MSG, consentId, e.getMessage());
            log.error(msg);
            ObaErrorCode errorCode = e.status() == 404
                                         ? NOT_FOUND
                                         : CONNECTION_ERROR;
            throw ObaException.builder()
                      .devMessage(msg)
                      .obaErrorCode(errorCode)
                      .build();
        }
    }

    private String getDecryptedConsentId(String encryptedConsentId) {
        return securityDataService.decryptId(encryptedConsentId)
                   .orElseThrow(() -> ObaException.builder()
                                          .devMessage("Error decrypting consent id")
                                          .obaErrorCode(AIS_BAD_REQUEST)
                                          .build());
    }

    private String writeScaResponseAsString(SCAResponseTO ledgerValidateTanConsentResponse) {
        try {
            return getEncoder().encodeToString(objectMapper.writeValueAsBytes(ledgerValidateTanConsentResponse));
        } catch (JsonProcessingException e) {
            throw ObaException.builder()
                      .devMessage("Could not encode ledgers consent confirmation response.")
                      .obaErrorCode(AIS_BAD_REQUEST)
                      .build();
        }
    }

    private SCAConsentResponseTO authorizeConsentAtLedgers(String authorizationId, String tan) {
        try {
            return mapToScaConsentResponse(requireNonNull(redirectScaRestClient.validateScaCode(authorizationId, tan).getBody()));
        } catch (FeignException e) {
            throw ObaException.builder()
                      .devMessage(getDevMessageFromFeignException(e))
                      .obaErrorCode(AIS_BAD_REQUEST)
                      .build();
        }
    }

    private SCAConsentResponseTO mapToScaConsentResponse(GlobalScaResponseTO source) {
        SCAConsentResponseTO target = new SCAConsentResponseTO();
        target.setConsentId(source.getOperationObjectId());
        target.setPartiallyAuthorised(source.isPartiallyAuthorised());
        target.setScaStatus(source.getScaStatus());
        target.setAuthorisationId(source.getAuthorisationId());
        target.setScaMethods(source.getScaMethods());
        target.setChosenScaMethod(null);//TODO FIX ME
        target.setChallengeData(source.getChallengeData());
        target.setPsuMessage(source.getPsuMessage());
        target.setStatusDate(source.getStatusDate());
        target.setExpiresInSeconds(source.getExpiresInSeconds());
        target.setMultilevelScaRequired(source.isMultilevelScaRequired());
        target.setAuthConfirmationCode(source.getAuthConfirmationCode());
        target.setBearerToken(source.getBearerToken());
        target.setObjectType(source.getOpType().name());
        return target;
    }

    private String getDevMessageFromFeignException(FeignException e) {
        try {
            return objectMapper.readTree(e.responseBody().map(ByteBuffer::array).orElse(new byte[]{})).get("devMessage").asText();
        } catch (IOException i) {
            return "Could not extract exception message from ASPSP response";
        }
    }

    private void setActiveAccessTokenFromConsentData(String encryptedConsentId) {
        String token;
        try {
            byte[] decodedData = aspspDataService.readAspspConsentData(encryptedConsentId)
                                     .map(AspspConsentData::getAspspConsentDataBytes)
                                     .orElseThrow(() -> ObaException.builder()
                                                            .devMessage(COULD_NOT_RETRIEVE_ASPSP_CONSENT_DATA)
                                                            .obaErrorCode(AIS_BAD_REQUEST)
                                                            .build());
            token = Optional.ofNullable(objectMapper.readTree(decodedData).get("bearerToken"))
                        .map(t -> t.get("access_token"))
                        .map(JsonNode::asText)
                        .orElseThrow(() -> ObaException.builder()
                                               .devMessage("No AccessToken present in ASPSP consent data")
                                               .obaErrorCode(AIS_BAD_REQUEST)
                                               .build());
        } catch (IOException e) {
            throw ObaException.builder()
                      .devMessage("Could not parse ASPSP consent data")
                      .obaErrorCode(AIS_BAD_REQUEST)
                      .build();
        }
        authInterceptor.setAccessToken(token);
    }

    private List<ObaAisConsent> toObaAisConsent(Collection<CmsAisAccountConsent> aisAccountConsents) {
        return aisAccountConsents.stream()
                   .map(a -> new ObaAisConsent(securityDataService.encryptId(a.getId()).orElse(""), a))
                   .collect(Collectors.toList());
    }
}
