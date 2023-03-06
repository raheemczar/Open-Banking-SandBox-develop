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

package de.adorsys.ledgers.oba.rest.server.resource.exception.resolver;

import de.adorsys.ledgers.oba.service.api.domain.exception.ObaErrorCode;
import org.springframework.http.HttpStatus;

import java.util.EnumMap;
import java.util.Map;

import static de.adorsys.ledgers.oba.service.api.domain.exception.ObaErrorCode.*;

public class AisExceptionStatusResolver {
    private static final Map<ObaErrorCode, HttpStatus> container = new EnumMap<>(ObaErrorCode.class);

    static {
        //400 Block
        container.put(AIS_BAD_REQUEST, HttpStatus.BAD_REQUEST);

        //401 Block
        container.put(ACCESS_FORBIDDEN, HttpStatus.FORBIDDEN);
        //404 Block
        container.put(NOT_FOUND, HttpStatus.NOT_FOUND);

        //500 Block
        container.put(CONNECTION_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        container.put(CONVERSION_EXCEPTION, HttpStatus.INTERNAL_SERVER_ERROR);

        container.put(AUTH_EXPIRED, HttpStatus.UNAUTHORIZED);
        container.put(LOGIN_FAILED, HttpStatus.UNAUTHORIZED);
        container.put(RESOURCE_EXPIRED, HttpStatus.GONE);
    }

    private AisExceptionStatusResolver() {
    }

    public static HttpStatus resolveHttpStatusByCode(ObaErrorCode code) {
        return container.get(code);
    }
}
