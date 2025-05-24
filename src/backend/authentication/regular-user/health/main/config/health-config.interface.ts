import { IHealthInfrastructureConfig } from '../../infrastructure/config/health-config';

export interface IHealthConfig {
    readonly infrastructure: IHealthInfrastructureConfig;
}
