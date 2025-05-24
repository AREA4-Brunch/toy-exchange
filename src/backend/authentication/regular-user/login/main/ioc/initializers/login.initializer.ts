import { Router } from 'express';
import { injectable, singleton } from 'tsyringe';
import { RoutesInitializer } from '../../../../../shared/main/ioc/initializers/routes-initializer.base';
import { LoginRouter } from '../../../infrastructure/api/routes/login.router';
import { ILoginConfig } from '../../config/login-config.interface';

@singleton()
@injectable()
export class LoginInitializer extends RoutesInitializer<ILoginConfig> {
    constructor(private readonly loginRouter: LoginRouter) {
        super();
    }

    protected override async loadRoutes(
        router: Router,
        config: ILoginConfig,
    ): Promise<Router> {
        this.registerRouters(router, this.loginRouter.getRouters());
        this.registerStaticRoutes(router, config.infrastructure.api.routes);
        return router;
    }
}
