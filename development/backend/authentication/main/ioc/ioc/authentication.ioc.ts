import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { RegularUserIoC } from '../../../regular-user/main/ioc/ioc/regular-user.ioc';
import { CompositeInitializer } from '../../../shared/main/ioc/initializer.base';
import { IAuthenticationConfig } from '../../config/authentication.config.interface';
import { AuthenticationPresentationInit } from '../initializers/authentication.presentation.initializer';

@singleton()
@injectable()
export class AuthenticationIoC extends CompositeInitializer<IAuthenticationConfig> {
    constructor(private readonly presentation: AuthenticationPresentationInit) {
        super();
    }

    public async initialize(
        container: DependencyContainer,
        config: IAuthenticationConfig,
    ): Promise<void> {
        await this.presentation.initialize(container, config);

        await this.initChildrenInParallel(container, [
            [
                [
                    container.createChildContainer(),
                    RegularUserIoC,
                    config.features.regularUser,
                ],
            ],
        ]);

        this.presentation.callback();
    }
}
