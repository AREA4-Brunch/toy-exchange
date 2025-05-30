import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const AuthTokenDataSchema = z.object({
    jti: z.string(),
    email: z.string().email(),
    roles: z.array(z.string()),
});

export type IAuthTokenData = z.infer<typeof AuthTokenDataSchema>;

export class AuthTokenDataInterpreter {
    constructor(public data: IAuthTokenData) {
        AuthTokenDataSchema.parse(data);
    }

    public hasAllRoles(roles: Set<string>) {
        return this.data.roles.every((role) => roles.has(role));
    }

    public hasSomeRoles(roles: Set<string>) {
        return this.data.roles.some((role) => roles.has(role));
    }

    public hasNoRoles(roles: Set<string>) {
        return !this.data.roles.some((role) => roles.has(role));
    }
}

export class AuthorizationHeaderMissing extends Error {
    constructor() {
        super('Authorization header is missing.');
    }
}

export class AuthorizationHeaderInvalid extends Error {
    constructor() {
        super('Authorization header is invalid.');
    }
}

export class AuthTokenRequestParser {
    constructor(private readonly jwtSecretKey: string) {}

    public getData(req: Request): [string, AuthTokenDataInterpreter] {
        const [token, payload] = this.getPayload(req);
        return [token, this.getDataFromPayload(payload)];
    }

    public getDataFromPayload(payload: jwt.JwtPayload) {
        return new AuthTokenDataInterpreter(payload as IAuthTokenData);
    }

    public getPayload(req: Request): [string, jwt.JwtPayload] {
        const token = this.fetchToken(req);
        const payload = this.validateAuthToken(token);
        return [token, payload];
    }

    public validateAuthToken(token: string): jwt.JwtPayload {
        return jwt.verify(token, this.jwtSecretKey) as jwt.JwtPayload;
    }

    public fetchToken(req: Request): string {
        const token = req.headers['authorization'];
        if (!token) {
            throw new AuthorizationHeaderMissing();
        }
        if (!token.startsWith('Bearer ')) {
            throw new AuthorizationHeaderInvalid();
        }
        return token.substring('Bearer '.length);
    }
}
