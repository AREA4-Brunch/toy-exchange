import { ITokenServiceConfig } from '../../services/jwt.token.service';

export interface ILoginInfrastructureConfig {
    tokenService: ITokenServiceConfig;
}
