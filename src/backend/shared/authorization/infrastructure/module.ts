import { AuthorizationMiddleware } from './middleware';
import { AuthTokenRequestParser } from './token';

export interface IAuthorizationModuleConfig {
    jwtSecretKey: string;
}

export class AuthorizationModule {
    public readonly authorizationMiddleware: AuthorizationMiddleware;
    public readonly authorizationTokenReqParser: AuthTokenRequestParser;

    constructor(config: IAuthorizationModuleConfig) {
        this.authorizationTokenReqParser = new AuthTokenRequestParser(
            config.jwtSecretKey,
        );
        this.authorizationMiddleware = new AuthorizationMiddleware(
            this.authorizationTokenReqParser,
        );
    }
}
