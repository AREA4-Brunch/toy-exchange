import express from 'express';
import { DependencyContainer, injectable, singleton } from 'tsyringe';
import {
    IoC,
    IoCModule,
} from '../../../../shared/main/ioc/initializers/ioc-initializer.base';
import { HealthBinder } from '../../../health/main/binders/health.binder';
import { IHealthConfig } from '../../../health/main/config/health-config.interface';
import { HealthInitializer } from '../../../health/main/initializers/health.initializer';
import { ILoginConfig } from '../../../login/main/config/login-config.interface';
import { LoginBinder } from '../../../login/main/ioc/binders/login.binder';
import { LoginInitializer } from '../../../login/main/ioc/initializers/login.initializer';
import { IRegularUserConfig } from '../../config/app-config.interface';

@singleton()
@injectable()
class LoginIoC extends IoC<IRegularUserConfig> {
    protected override async bind(
        container: DependencyContainer,
        config: IRegularUserConfig,
    ): Promise<DependencyContainer> {
        const loginContainer = container.createChildContainer();
        // !important fetch binder from the child container, not parent as
        // when in constructor
        await loginContainer
            .resolve(LoginBinder)
            .bind(loginContainer, config.features.login);
        return loginContainer;
    }

    protected override async getChildConfig(
        config: IRegularUserConfig,
    ): Promise<ILoginConfig> {
        return config.features.login;
    }

    protected override async initChildIoC(
        loginContainer: DependencyContainer,
        loginRouter: express.Router,
        loginConfig: ILoginConfig,
    ): Promise<void> {
        // !important fetch initializer from the child container, not parent as
        // when in constructor
        await loginContainer
            .resolve(LoginInitializer)
            .initialize(loginContainer, loginRouter, loginConfig);
    }
}

@singleton()
@injectable()
class HealthIoC extends IoC<IRegularUserConfig> {
    protected override async bind(
        container: DependencyContainer,
        config: IRegularUserConfig,
    ): Promise<DependencyContainer> {
        const healthContainer = container.createChildContainer();
        // !important fetch binder from the child container, not parent as
        // when in constructor
        await healthContainer
            .resolve(HealthBinder)
            .bind(healthContainer, config.features.health);
        return healthContainer;
    }

    protected override async getChildConfig(
        config: IRegularUserConfig,
    ): Promise<IHealthConfig> {
        return config.features.health;
    }

    protected override async initChildIoC(
        healthContainer: DependencyContainer,
        healthRouter: express.Router,
        healthConfig: IHealthConfig,
    ): Promise<void> {
        // !important fetch initializer from the child container, not parent as
        // when in constructor
        await healthContainer
            .resolve(HealthInitializer)
            .initialize(healthContainer, healthRouter, healthConfig);
    }
}

@singleton()
@injectable()
export class RegularUserInitializer extends IoCModule<IRegularUserConfig> {
    constructor(
        readonly login: LoginIoC,
        readonly health: HealthIoC,
    ) {
        super([login, health]);
    }

    protected override async loadRoutes(
        router: express.Router,
        config: IRegularUserConfig,
    ): Promise<express.Router> {
        const childRouter = express.Router();
        router.use(config.api.basePath, childRouter);
        return childRouter;
    }
}
