import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { inject, injectable, singleton } from 'tsyringe';
import { ITokenService } from '../../application/services/token.service.interface';
import { LOGIN_INFRASTRUCTURE_TYPES } from '../di/login-types';

export interface ITokenServiceConfig {
    jwtSecretKey: string;
    jwtTokenDurationSecs: number;
}

@singleton()
@injectable()
export class TokenService implements ITokenService {
    constructor(
        @inject(LOGIN_INFRASTRUCTURE_TYPES.TokenServiceConfig)
        private readonly config: ITokenServiceConfig,
    ) {}

    public static generateJwtSecretKey(
        encoding: BufferEncoding = 'hex',
    ): string {
        return crypto.randomBytes(32).toString(encoding);
    }

    public generateAuthToken(email: string, roles: string[]): [string, string] {
        const jti = crypto.randomUUID();
        const token = jwt.sign(
            {
                jti: jti,
                email: email,
                roles: roles,
            },
            this.getJwtSecretKey(),
            {
                expiresIn: this.getJwtTokenDuration(),
            },
        );
        return [token, jti];
    }

    protected getJwtSecretKey(): string {
        return this.config.jwtSecretKey;
    }

    protected getJwtTokenDuration(): number {
        return this.config.jwtTokenDurationSecs;
    }
}
