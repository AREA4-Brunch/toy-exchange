import { IHealthInfrastructureConfig } from '../../infrastructure/config/health.config.interface';

export interface IHealthConfig {
    readonly infrastructure: IHealthInfrastructureConfig;
}
