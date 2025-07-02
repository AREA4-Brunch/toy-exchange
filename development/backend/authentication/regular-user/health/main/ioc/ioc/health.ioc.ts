import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { CompositeInitializer } from '../../../../../shared/main/ioc/initializer.base';
import { IHealthConfig } from '../../config/health.config.interface';
import { HealthApiInitializer } from '../initializers/health.api.initializer';
import { HealthBinder } from '../initializers/health.binder.initializer';

@singleton()
@injectable()
export class HealthIoC extends CompositeInitializer<IHealthConfig> {
    constructor(private readonly binder: HealthBinder) {
        super();
    }

    public async initialize(
        container: DependencyContainer,
        config: IHealthConfig,
    ): Promise<void> {
        await this.binder.initialize(container, config);

        if (config.presentation.api) {
            this.initChildrenInParallel(container, [
                [[container, HealthApiInitializer, config.presentation.api]],
            ]);
        }
    }
}
