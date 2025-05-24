import { IRoutesConfig } from '../../../../shared/infrastructure/config/infrastructure-config.interface';

export interface IHealthInfrastructureConfig {
    readonly api: {
        readonly routes: IHealthRoutesConfig;
    };
}

export interface IHealthRoutesConfig extends IRoutesConfig {}
