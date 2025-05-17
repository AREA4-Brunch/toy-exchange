import express from 'express';
import cors from 'cors';
import { inject, injectable } from 'tsyringe';
import { IInitializer } from '../../../../shared/main/ioc/initializers/initializer.interface';
import { MAIN_TYPES } from '../../../../shared/main/di/types';
import { RouterRegistry } from '../../../infrastructure/api/routes/router-registry';
import { IConfigInfrastructure } from '../../../infrastructure/config/infrastructure-config.interface';
import { INFRASTRUCTURE_TYPES } from '../../../infrastructure/di/types';

@injectable()
export class ExpressInitializer implements IInitializer {
    constructor(
        @inject(MAIN_TYPES.App) private readonly app: express.Express,
        @inject(INFRASTRUCTURE_TYPES.ConfigInfrastructure)
        private readonly conf: IConfigInfrastructure,
        private readonly routerRegistry: RouterRegistry,
    ) {}

    public init(): void {
        // !important order matches the order of handling the request:
        this.loadGlobalMiddleware();
        this.loadRoutes();
        this.loadGlobalErrorHandlingMiddleware();
    }

    protected loadGlobalMiddleware() {
        this.app.use(express.json());
        this.app.use(cors());
    }

    protected loadRoutes() {
        this.exposeStaticDirs();
        this.app.use(
            this.conf.api.routes.apiBasePath,
            this.routerRegistry.mainRouter,
        );
    }

    protected loadGlobalErrorHandlingMiddleware() {}

    private exposeStaticDirs() {
        const staticBasePath = this.conf.api.routes.staticBasePath;
        this.conf.api.routes.staticContent.forEach(({ route, fspath }) => {
            const absRoute = `${staticBasePath}${route}`;
            this.app.use(absRoute, express.static(fspath));
            console.log(`Exposing static artifact: ${fspath}\nat ${absRoute}`);
        });
    }
}
