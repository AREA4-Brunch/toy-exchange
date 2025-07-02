import { Router } from 'express';
import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { IInitializer } from '../../../../shared/main/ioc/initializer.base';
import { HEALTH_MAIN_TYPES } from '../../../health/main/di/health.types';
import { LOGIN_MAIN_TYPES } from '../../../login/main/di/login.types';
import { IRegularUserConfig } from '../../config/regular-user.config.interface';
import { REGULAR_USER_TYPES } from '../../di/regular-user.types';

@singleton()
@injectable()
export class RegularUserPresentationInit
    implements IInitializer<IRegularUserConfig>
{
    public async initialize(
        container: DependencyContainer,
        config: IRegularUserConfig,
    ): Promise<void> {
        if (config.presentation.api) {
            this.setupApiPresentation(container, config);
        }
    }

    private setupApiPresentation(
        container: DependencyContainer,
        config: IRegularUserConfig,
    ) {
        const childRouter: Router = Router();
        const root = container.resolve<Router>(REGULAR_USER_TYPES.RootRouter);
        root.use(config.presentation.api!.basePath, childRouter);

        if (config.features.login.presentation.api) {
            container.registerInstance<Router>(
                LOGIN_MAIN_TYPES.RootRouter,
                childRouter!,
            );
        }

        if (config.features.health.presentation.api) {
            container.registerInstance<Router>(
                HEALTH_MAIN_TYPES.RootRouter,
                childRouter!,
            );
        }
    }
}
