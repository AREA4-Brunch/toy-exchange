import { Router } from 'express';
import { injectable, singleton } from 'tsyringe';
import { RoutesLoader } from '../../../../../shared/main/ioc/routes-loaders/routes-loader.base';
import { HealthRouter } from '../../../infrastructure/api/health.router';
import { IHealthConfig } from '../../config/health.config.interface';

@singleton()
@injectable()
export class HealthRoutesLoader extends RoutesLoader<IHealthConfig> {
    constructor(private readonly healthRouter: HealthRouter) {
        super();
    }

    public override async loadRoutes(
        router: Router,
        config: IHealthConfig,
    ): Promise<Router> {
        this.registerRouters(router, this.healthRouter.getRouters());
        this.registerStaticRoutes(router, config.infrastructure.api.routes);
        return router;
    }
}
