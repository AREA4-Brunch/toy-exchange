import { Email } from '../../../../../shared/core/value-objects/email';
import { RegularUserRole } from '../../../core/value-objects/regular-user-role';

export interface IAuthTokenData {
    jti: string;
    email: string;
    roles: string[];
}

export interface ITokenService {
    generateAuthToken(
        email: Email,
        roles: RegularUserRole[],
    ): [string, IAuthTokenData];
}
