import { IRoutesConfig } from '../../../../shared/infrastructure/config/infrastructure.config.interface';
import { ITokenServiceConfig } from '../services/token.service';

export interface ILoginInfrastructureConfig {
    readonly api: {
        readonly routes: ILoginRoutesConfig;
        readonly middleware: ILoginMiddlewareConfig;
    };
    readonly tokenService: ITokenServiceConfig;
}

export interface ILoginRoutesConfig extends IRoutesConfig {}

export interface ILoginMiddlewareConfig {}
