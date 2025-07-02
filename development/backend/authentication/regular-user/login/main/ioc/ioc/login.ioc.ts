import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { CompositeInitializer } from '../../../../../shared/main/ioc/initializer.base';
import { ILoginConfig } from '../../config/login.config.interface';
import { LoginApiInitializer } from '../initializers/login.api.initializer';
import { LoginBinder } from '../initializers/login.binder.initializer';

@singleton()
@injectable()
export class LoginIoC extends CompositeInitializer<ILoginConfig> {
    constructor(private readonly binder: LoginBinder) {
        super();
    }

    public async initialize(
        container: DependencyContainer,
        config: ILoginConfig,
    ): Promise<void> {
        await this.binder.initialize(container, config);

        if (config.presentation.api) {
            this.initChildrenInParallel(container, [
                [[container, LoginApiInitializer, config.presentation.api]],
            ]);
        }
    }
}
