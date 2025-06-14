import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { IIoCBinder } from '../../../../shared/main/ioc/binders/ioc-binder.interface';
import { IHealthConfig } from '../../../health/main/config/health.config.interface';
import { HEALTH_MAIN_TYPES } from '../../../health/main/ioc/di/health.types';
import { IRegularUserConfig } from '../../config/app.config.interface';

@singleton()
@injectable()
export class RegularUserBinder implements IIoCBinder<IRegularUserConfig> {
    public async bind(
        container: DependencyContainer,
        config: IRegularUserConfig,
    ): Promise<void> {
        health(container, config.features.health);
    }
}

const health = (container: DependencyContainer, conf: IHealthConfig) => {
    container.registerInstance<IHealthConfig>(HEALTH_MAIN_TYPES.Config, conf);
};
