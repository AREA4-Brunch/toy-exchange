import cors from 'cors';
import express from 'express';
import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { IRegularUserConfig } from '../../../regular-user/main/config/app-config.interface';
import { RegularUserBinder } from '../../../regular-user/main/ioc/binders/regular-user.binder';
import { RegularUserInitializer } from '../../../regular-user/main/ioc/initializers/regular-user.initializer';
import {
    IoC,
    IoCModule,
} from '../../../shared/main/ioc/initializers/ioc-initializer.base';
import { IAuthenticationConfig } from '../../config/auth-config.interface';

@singleton()
@injectable()
class RegularUserIoC extends IoC<IAuthenticationConfig> {
    protected override async bind(
        container: DependencyContainer,
        config: IAuthenticationConfig,
    ): Promise<DependencyContainer> {
        const regularUserContainer = container.createChildContainer();
        await regularUserContainer
            .resolve(RegularUserBinder)
            .bind(regularUserContainer, config.regularUser);
        return regularUserContainer;
    }

    protected override async getChildConfig(
        config: IAuthenticationConfig,
    ): Promise<IRegularUserConfig> {
        return config.regularUser;
    }

    protected override async initChildIoC(
        container: DependencyContainer,
        router: express.Router,
        config: IRegularUserConfig,
    ): Promise<void> {
        await container
            .resolve(RegularUserInitializer)
            .initialize(container, router, config);
    }
}

@singleton()
@injectable()
export class AuthenticationInitializer extends IoCModule<IAuthenticationConfig> {
    constructor(readonly regularUser: RegularUserIoC) {
        super([regularUser]);
    }

    protected override async loadRoutes(
        router: express.Router,
        config: IAuthenticationConfig,
    ): Promise<express.Router> {
        const authenticationRouter = express.Router();
        this.loadGlobalMiddleware(authenticationRouter);
        router.use(config.api.basePath, authenticationRouter);
        return authenticationRouter;
    }

    private loadGlobalMiddleware(router: express.Router) {
        router.use(cors());
        router.use(express.json());
    }
}
