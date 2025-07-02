import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { RequestLoggingMiddleware } from '../../../../shared/presentation/api/middleware/request-logging.middleware';
import { RouterRoot } from '../../../../shared/presentation/api/routes/router-root';
import { IHealthRoutesConfig } from '../config/health.config.interface';
import { HEALTH_PRESENTATION_TYPES } from '../di/health.types';
import { HealthHandler } from './health.handler';

@singleton()
@injectable()
export class HealthRouter extends RouterRoot {
    constructor(
        @inject(HEALTH_PRESENTATION_TYPES.RoutesConfig)
        private readonly routesConfig: IHealthRoutesConfig,
        private readonly healthHandler: HealthHandler,
        private readonly requestLogging: RequestLoggingMiddleware,
    ) {
        super();
    }

    protected getRouters(): { path: string; router: express.Router }[] {
        return [
            {
                path: this.routesConfig.healthBasePath,
                router: this.createHealthRouter(),
            },
        ];
    }

    private createHealthRouter() {
        const health = express.Router();
        health.use(this.requestLogging.createLogRequest());
        health.route(``).get((req, res) => this.healthHandler.ping(req, res));

        return health;
    }
}
