import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { IIoCBinder } from '../../../../shared/main/ioc/binders/ioc-binder.interface';
import {
    IHealthInfrastructureConfig,
    IHealthRoutesConfig,
} from '../../infrastructure/config/health-config';
import { HEALTH_INFRASTRUCTURE_TYPES } from '../../infrastructure/di/health-types';
import { IHealthConfig } from '../config/health-config.interface';

@singleton()
@injectable()
export class HealthBinder implements IIoCBinder<IHealthConfig> {
    public async bind(
        container: DependencyContainer,
        config: IHealthConfig,
    ): Promise<void> {
        infrastructure(container, config.infrastructure);
    }
}

const infrastructure = (
    container: DependencyContainer,
    conf: IHealthInfrastructureConfig,
): void => {
    container.registerInstance<IHealthRoutesConfig>(
        HEALTH_INFRASTRUCTURE_TYPES.RoutesConfig,
        conf.api.routes,
    );
};
