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

package de.adorsys.psd2.sandbox.tpp.rest.api.resource;

import de.adorsys.ledgers.middleware.api.domain.account.AccountDetailsTO;
import de.adorsys.ledgers.middleware.api.domain.account.AccountReportTO;
import de.adorsys.ledgers.middleware.api.domain.payment.AmountTO;
import de.adorsys.ledgers.util.domain.CustomPageImpl;
import de.adorsys.psd2.sandbox.tpp.rest.api.domain.AccountAccess;
import de.adorsys.psd2.sandbox.tpp.rest.api.domain.AccountReport;
import de.adorsys.psd2.sandbox.tpp.rest.api.domain.DepositAccount;
import io.swagger.annotations.*;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
@Api(tags = "TPP Accounts management")
public interface TppAccountsRestApi {

    String BASE_PATH = "/tpp/accounts";

    @ApiOperation(value = "Create account for a given user",
        notes = "Endpoint to a deposit account for a user with given ID",
        authorizations = @Authorization(value = "apiKey"))
    @PostMapping
    ResponseEntity<Void> createAccount(@RequestParam(value = "userId") String userId, @RequestBody DepositAccount account);

    @ApiOperation(value = "Update Account access for a given user",
        notes = "Endpoint to update account access with given iban for a user with given ID ",
        authorizations = @Authorization(value = "apiKey"))
    @PutMapping("/access")
    ResponseEntity<Void> updateAccountAccess(@RequestBody AccountAccess accountAccess);

    /**
     * Returns the list of accounts that belong to the same branch as STAFF user.
     *
     * @return list of accounts that belongs to the same branch as staff user.
     */
    @ApiOperation(value = "Get list of Accessible Accounts",
        notes = "Returns the list of all accounts connected to the given TPP",
        authorizations = @Authorization(value = "apiKey"))
    @ApiResponses(value = {
        @ApiResponse(code = 200, response = AccountDetailsTO[].class, message = "List of accounts accessible to the TPP.")
    })
    @GetMapping
    ResponseEntity<List<AccountDetailsTO>> getAllAccounts();

    /**
     * Returns the list of accounts that belong to the same branch as STAFF user, paged view.
     *
     * @return list of accounts that belongs to the same branch as staff user.
     */
    @ApiOperation(value = "Get list of Accessible Accounts, paged view",
        notes = "Returns the list of all accounts connected to the given TPP",
        authorizations = @Authorization(value = "apiKey"))
    @ApiResponses(value = {
        @ApiResponse(code = 200, response = AccountDetailsTO[].class, message = "List of accounts accessible to the TPP.")
    })
    @GetMapping("/page")
    ResponseEntity<CustomPageImpl<AccountDetailsTO>> getAllAccounts(
        @RequestParam(value = "queryParam", required = false, defaultValue = "") String queryParam,
        @RequestParam(value = "page", required = false, defaultValue = "0") int page,
        @RequestParam(value = "size", required = false, defaultValue = "25") int size,
        @RequestParam(value = "withBalance", required = false, defaultValue = "false") boolean withBalance);

    /**
     * Returns a single account by its ID if it belong to the same branch as STAFF user.
     *
     * @return single account by its ID if it belong to the same branch as STAFF user.
     */
    @ApiOperation(value = "Get an account by its ID",
        notes = "Returns the account by its ID if it belongs to the TPP",
        authorizations = @Authorization(value = "apiKey"))
    @ApiResponses(value = {
        @ApiResponse(code = 200, response = AccountDetailsTO[].class, message = "Account details by its ID if it is accessible by the TPP")
    })
    @GetMapping(value = "/{accountId}")
    ResponseEntity<AccountDetailsTO> getSingleAccount(@PathVariable("accountId") String accountId);

    /**
     * Returns an account report by its ID if it belong to the same branch as STAFF user.
     *
     * @return single account report by its ID if it belong to the same branch as STAFF user.
     */
    @ApiOperation(value = "Get an account report by its ID",
        notes = "Returns the account report by its ID if it belongs to the TPP",
        authorizations = @Authorization(value = "apiKey"))
    @ApiResponses(value = {
        @ApiResponse(code = 200, response = AccountReportTO.class, message = "Account report by its ID if it is accessible by the TPP")
    })
    @GetMapping(value = "/report/{accountId}")
    ResponseEntity<AccountReport> accountReport(@PathVariable("accountId") String accountId);

    /**
     * Returns a single account by its ID if it belong to the same branch as STAFF user.
     *
     * @return single account by its ID if it belong to the same branch as STAFF user.
     */
    @ApiOperation(value = "Deposit cash to an account by its ID",
        notes = "Deposits cash to the account by its ID if it belongs to the TPP",
        authorizations = @Authorization(value = "apiKey"))
    @ApiResponses(value = {
        @ApiResponse(code = 200, response = AccountDetailsTO[].class, message = "Deposits cash to the account by its ID")
    })
    @PostMapping(value = "/{accountId}/deposit-cash")
    ResponseEntity<Void> depositCash(@PathVariable("accountId") String accountId, @RequestBody AmountTO amount);

    @GetMapping("/example")
    @ApiOperation(value = "Download account template", authorizations = @Authorization(value = "apiKey"))
    ResponseEntity<Resource> downloadAccountTemplate();

    @ApiOperation(value = "Block/Unblock Account",
        notes = "Changes block state for given account, returns status being set to the block",
        authorizations = @Authorization(value = "apiKey"))
    @PostMapping("/status")
    ResponseEntity<Boolean> changeStatus(@RequestParam(value = "accountId") String accountId);

    @ApiOperation(value = "Update credit limit for account",
        notes = "Enables/Disables credit limit for certain account",
        authorizations = @Authorization(value = "apiKey"))
    @PutMapping("/credit")
    ResponseEntity<Void> updateCreditLimit(@RequestParam(value = "accountId") String accountId, @RequestBody BigDecimal creditAmount);
}
