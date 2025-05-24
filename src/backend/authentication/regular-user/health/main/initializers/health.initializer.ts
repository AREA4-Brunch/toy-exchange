import { Router } from 'express';
import { injectable, singleton } from 'tsyringe';
import { RoutesInitializer } from '../../../../shared/main/ioc/initializers/routes-initializer.base';
import { HealthRouter } from '../../infrastructure/api/health.router';
import { IHealthConfig } from '../config/health-config.interface';

@singleton()
@injectable()
export class HealthInitializer extends RoutesInitializer<IHealthConfig> {
    constructor(private readonly healthRouter: HealthRouter) {
        super();
    }

    protected override async loadRoutes(
        router: Router,
        config: IHealthConfig,
    ): Promise<Router> {
        this.registerRouters(router, this.healthRouter.getRouters());
        this.registerStaticRoutes(router, config.infrastructure.api.routes);
        return router;
    }
}
