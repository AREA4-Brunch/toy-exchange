import { RegularUserRole } from '../../../core/value-objects/regular-user-role';

export interface IAuthTokenData {
    jti: string;
    email: string;
    roles: string[];
}

export interface ITokenService {
    generateAuthToken(
        email: string,
        roles: RegularUserRole[],
    ): [string, IAuthTokenData];
}
