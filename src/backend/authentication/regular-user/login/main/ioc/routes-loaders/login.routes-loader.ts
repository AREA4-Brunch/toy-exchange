import { Router } from 'express';
import { injectable, singleton } from 'tsyringe';
import { RoutesLoader } from '../../../../../shared/main/ioc/routes-loaders/routes-loader.base';
import { LoginRouter } from '../../../infrastructure/api/routes/login.router';
import { ILoginConfig } from '../../config/login.config.interface';

@singleton()
@injectable()
export class LoginRoutesLoader extends RoutesLoader<ILoginConfig> {
    constructor(private readonly loginRouter: LoginRouter) {
        super();
    }

    public async loadRoutes(
        router: Router,
        config: ILoginConfig,
    ): Promise<Router> {
        this.registerRouters(router, this.loginRouter.getRouters());
        this.registerStaticRoutes(router, config.infrastructure.api.routes);
        return router;
    }
}
