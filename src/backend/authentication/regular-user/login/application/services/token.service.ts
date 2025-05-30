import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { inject, injectable, singleton } from 'tsyringe';
import { LOGIN_APPLICATION_TYPES } from '../di/login-application.types';

export interface ITokenServiceConfig {
    jwtSecretKey: string;
    jwtTokenDurationSecs: number;
}

@singleton()
@injectable()
export class TokenService {
    constructor(
        @inject(LOGIN_APPLICATION_TYPES.TokenServiceConfig)
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
