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

package de.adorsys.ledgers.oba.rest.api.resource;

import de.adorsys.ledgers.oba.service.api.domain.PaymentAuthorizeResponse;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.Authorization;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Api(value = PisCancellationApi.BASE_PATH, tags = "PSU PIS. Provides access to online banking payment functionality")
public interface PisCancellationApi {
    String BASE_PATH = "/pis-cancellation";


    /**
     * Identifies the user by login an pin. Return sca methods information
     *
     * @param encryptedPaymentId  the encryptedPaymentId
     * @param authorisationId     the auth id
     * @param login               the login
     * @param pin                 the password
     * @return PaymentAuthorizeResponse
     */
    @PostMapping(path = "/{encryptedPaymentId}/authorisation/{authorisationId}/login")
    @ApiOperation(value = "Identifies the user by login an pin. Return sca methods information")
    ResponseEntity<PaymentAuthorizeResponse> login(
        @PathVariable("encryptedPaymentId") String encryptedPaymentId,
        @PathVariable("authorisationId") String authorisationId,
        @RequestParam(value = "login", required = false) String login,
        @RequestParam(value = "pin", required = false) String pin);

    /**
     * Selects the SCA Method for use.
     *
     * @param encryptedPaymentId                the sca id
     * @param authorisationId                   the auth id
     * @param scaMethodId                       sca
     * @return PaymentAuthorizeResponse
     */
    @PostMapping("/{encryptedPaymentId}/authorisation/{authorisationId}/methods/{scaMethodId}")
    @ApiOperation(value = "Selects the SCA Method for use.", authorizations = @Authorization(value = "apiKey"))
    ResponseEntity<PaymentAuthorizeResponse> selectMethod(
        @PathVariable("encryptedPaymentId") String encryptedPaymentId,
        @PathVariable("authorisationId") String authorisationId,
        @PathVariable("scaMethodId") String scaMethodId);

    /**
     * Provides a TAN for the validation of an authorization
     *
     * @param encryptedPaymentId                the sca id
     * @param authorisationId                   the auth id
     * @param authCode                          the auth code
     * @return PaymentAuthorizeResponse
     */
    @PostMapping(path = "/{encryptedPaymentId}/authorisation/{authorisationId}/authCode", params = {"authCode"})
    @ApiOperation(value = "Provides a TAN for the validation of an authorization", authorizations = @Authorization(value = "apiKey"))
    ResponseEntity<PaymentAuthorizeResponse> authorisePayment(
        @PathVariable("encryptedPaymentId") String encryptedPaymentId,
        @PathVariable("authorisationId") String authorisationId,
        @RequestParam("authCode") String authCode);

    /**
     * This call provides the server with the opportunity to close this session and
     * redirect the PSU to the TPP or close the application window.
     * <p>
     * In any case, the session of the user will be closed.
     *
     * @param encryptedPaymentId ID of Payment
     * @param authorisationId    ID of related Payment Authorisation
     * @return redirect location header with TPP url
     */
    @GetMapping(path = "/{encryptedPaymentId}/authorisation/{authorisationId}/done")
    @ApiOperation(value = "Close consent session", authorizations = @Authorization(value = "apiKey"),
        notes = "This call provides the server with the opportunity to close this session and "
                    + "redirect the PSU to the TPP or close the application window.")
    ResponseEntity<PaymentAuthorizeResponse> pisDone(
        @PathVariable("encryptedPaymentId") String encryptedPaymentId,
        @PathVariable("authorisationId") String authorisationId,
        @RequestParam(name = "oauth2", required = false, defaultValue = "false") boolean isOauth2Integrated,
        @RequestParam(name = "authConfirmationCode", required = false) String authConfirmationCode);

}
