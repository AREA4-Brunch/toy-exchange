import { IRoutesConfig } from '../../../../shared/infrastructure/config/infrastructure-config.interface';

export interface ILoginInfrastructureConfig {
    readonly api: {
        readonly routes: ILoginRoutesConfig;
        readonly middleware: ILoginMiddlewareConfig;
    };
}

export interface ILoginRoutesConfig extends IRoutesConfig {}

export interface ILoginMiddlewareConfig {}
