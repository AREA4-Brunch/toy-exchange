import { IAuthTokenData } from 'authorization/dist/infrastructure/token';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { inject, injectable, singleton } from 'tsyringe';
import { Email } from '../../../../shared/core/value-objects/email';
import { ITokenService } from '../../application/ports/services/token.service.interface';
import { RegularUserRole } from '../../core/value-objects/regular-user-role';
import { LOGIN_INFRASTRUCTURE_TYPES } from '../di/login.types';

export interface ITokenServiceConfig {
    jwtSecretKey: string;
    jwtTokenDurationSecs: number;
}

@singleton()
@injectable()
export class JwtTokenService implements ITokenService {
    constructor(
        @inject(LOGIN_INFRASTRUCTURE_TYPES.TokenServiceConfig)
        private readonly config: ITokenServiceConfig,
    ) {}

    public static generateJwtSecretKey(
        encoding: BufferEncoding = 'hex',
    ): string {
        return crypto.randomBytes(32).toString(encoding);
    }

    public generateAuthToken(
        email: Email,
        roles: RegularUserRole[],
    ): [string, IAuthTokenData] {
        const payload = this.createPayload(email.value, roles);
        const token = jwt.sign(payload, this.getJwtSecretKey(), {
            expiresIn: this.getJwtTokenDuration(),
        });
        return [token, payload];
    }

    protected getJwtSecretKey(): string {
        return this.config.jwtSecretKey;
    }

    protected getJwtTokenDuration(): number {
        return this.config.jwtTokenDurationSecs;
    }

    protected createPayload(
        email: string,
        roles: RegularUserRole[],
    ): IAuthTokenData {
        return {
            jti: crypto.randomUUID(),
            email: email,
            roles: roles.map((role) => role.value.toString()),
        };
    }
}
