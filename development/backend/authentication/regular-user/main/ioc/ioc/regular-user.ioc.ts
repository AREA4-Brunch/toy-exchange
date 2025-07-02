import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { CompositeInitializer } from '../../../../shared/main/ioc/initializer.base';
import { HealthIoC } from '../../../health/main/ioc/ioc/health.ioc';
import { LoginIoC } from '../../../login/main/ioc/ioc/login.ioc';
import { IRegularUserConfig } from '../../config/regular-user.config.interface';
import { RegularUserPresentationInit } from '../initializers/regular-user.presentation.initializer';

@singleton()
@injectable()
export class RegularUserIoC extends CompositeInitializer<IRegularUserConfig> {
    constructor(private readonly presentation: RegularUserPresentationInit) {
        super();
    }

    public async initialize(
        container: DependencyContainer,
        config: IRegularUserConfig,
    ): Promise<void> {
        await this.presentation.initialize(container, config);

        await this.initChildrenInParallel(container, [
            [
                [
                    container.createChildContainer(),
                    LoginIoC,
                    config.features.login,
                ],
            ],
            [
                [
                    container.createChildContainer(),
                    HealthIoC,
                    config.features.health,
                ],
            ],
        ]);
    }
}
