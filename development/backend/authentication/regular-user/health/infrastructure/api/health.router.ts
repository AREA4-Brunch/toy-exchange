import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { RequestLoggingMiddleware } from '../../../../shared/infrastructure/middleware/request-logging.middleware';
import { RoutesLoader } from '../../../../shared/infrastructure/routes/routes-loader.base';
import { IHealthRoutesConfig } from '../config/health.config.interface';
import { HEALTH_INFRASTRUCTURE_TYPES } from '../di/health.types';
import { HealthController } from './health.controller';

@singleton()
@injectable()
export class HealthRouter extends RoutesLoader<IHealthRoutesConfig> {
    constructor(
        @inject(HEALTH_INFRASTRUCTURE_TYPES.RoutesConfig)
        private readonly routesConfig: IHealthRoutesConfig,
        private readonly healthController: HealthController,
        private readonly requestLogging: RequestLoggingMiddleware,
    ) {
        super();
    }

    protected getRouters(): { path: string; router: express.Router }[] {
        return [
            {
                path: this.routesConfig.apiBasePath,
                router: this.createHealthRouter(),
            },
        ];
    }

    private createHealthRouter() {
        const health = express.Router();
        health.use(this.requestLogging.createLogRequest());
        health
            .route(``)
            .get((req, res) => this.healthController.ping(req, res));

        return health;
    }
}
