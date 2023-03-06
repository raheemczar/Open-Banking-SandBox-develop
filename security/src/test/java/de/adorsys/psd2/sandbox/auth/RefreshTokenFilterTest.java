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

package de.adorsys.psd2.sandbox.auth;

import de.adorsys.ledgers.keycloak.client.api.KeycloakTokenService;
import de.adorsys.ledgers.middleware.api.domain.um.AccessTokenTO;
import de.adorsys.ledgers.middleware.api.domain.um.BearerTokenTO;
import de.adorsys.ledgers.middleware.api.domain.um.UserRoleTO;
import de.adorsys.psd2.sandbox.auth.filter.RefreshTokenFilter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.servlet.FilterChain;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashSet;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RefreshTokenFilterTest {
    public static final String TOKEN_ID = "token_id";
    @Spy
    @InjectMocks
    RefreshTokenFilter filter;
    @Mock
    private HttpServletRequest request = Mockito.mock(MockHttpServletRequest.class);
    @Mock
    private HttpServletResponse response = new MockHttpServletResponse();

    @Mock
    private FilterChain chain;

    @Mock
    private KeycloakTokenService tokenService;


    @Test
    public void doFilterInternal() throws Exception {
        // Given
        SecurityContextHolder.clearContext();
        BearerTokenTO bearer = getBearer();
        when(request.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn(SecurityConstant.BEARER_TOKEN_PREFIX + bearer.getAccess_token());
        doReturn(120L).when(filter).expiredTimeInSec(anyString());
        doReturn(TOKEN_ID).when(filter).jwtId(anyString());
        doReturn(bearer.getRefresh_token()).when(filter).getCookieValue(request, SecurityConstant.REFRESH_TOKEN_COOKIE_PREFIX + TOKEN_ID);
        doReturn(true, false).when(filter).isExpiredToken(anyString());
        when(tokenService.refreshToken(anyString())).thenReturn(bearer);
        filter.doFilterInternal(request, response, chain);
        verify(tokenService, times(1)).refreshToken(anyString());

    }


    private BearerTokenTO getBearer() {
        AccessTokenTO token = new AccessTokenTO();
        token.setRole(UserRoleTO.CUSTOMER);
        return new BearerTokenTO("access_token", null, 600, "refresh_token", token, new HashSet<>());
    }
}

