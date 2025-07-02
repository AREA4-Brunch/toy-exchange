import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { IInitializer } from '../../../../../shared/main/ioc/initializer.base';
import {
    IHealthPresentationConfig,
    IHealthRoutesConfig,
} from '../../../presentation/config/health.config.interface';
import { HEALTH_PRESENTATION_TYPES } from '../../../presentation/di/health.types';
import { IHealthConfig } from '../../config/health.config.interface';

@singleton()
@injectable()
export class HealthBinder implements IInitializer<IHealthConfig> {
    public async initialize(
        container: DependencyContainer,
        config: IHealthConfig,
    ): Promise<void> {
        presentation(container, config.presentation);
    }
}

const presentation = (
    container: DependencyContainer,
    conf: IHealthPresentationConfig,
): void => {
    if (conf.api) {
        container.registerInstance<IHealthRoutesConfig>(
            HEALTH_PRESENTATION_TYPES.RoutesConfig,
            conf.api.routes,
        );
    }
};
