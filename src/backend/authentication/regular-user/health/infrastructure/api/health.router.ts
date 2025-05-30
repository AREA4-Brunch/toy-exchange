import { AuthorizationMiddleware } from 'authorization/dist/authorization/middleware';
import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { RequestLoggingMiddleware } from '../../../../shared/infrastructure/middleware/request-logging.middleware';
import { IHealthRoutesConfig } from '../config/health-config';
import { HEALTH_INFRASTRUCTURE_TYPES } from '../di/health-types';
import { HealthController } from './health.controller';

@singleton()
@injectable()
export class HealthRouter {
    constructor(
        @inject(HEALTH_INFRASTRUCTURE_TYPES.RoutesConfig)
        private readonly routesConfig: IHealthRoutesConfig,
        private readonly healthController: HealthController,
        private readonly requestLogging: RequestLoggingMiddleware,
        private readonly authorization: AuthorizationMiddleware,
    ) {}

    public getRouters(): { path: string; router: express.Router }[] {
        return [
            {
                path: this.routesConfig.apiBasePath,
                router: this.createHealthRouter(),
            },
            {
                path: `${this.routesConfig.apiBasePath}/test`,
                router: this.createTestRouter(),
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

    private createTestRouter() {
        const health = express.Router();

        health.use(this.requestLogging.createLogRequest());

        // prettier-ignore
        health
            .route(``)
            .get(
                this.authorization.createRequireLogin(),
                (req, res) => this.healthController.ping(req, res),
            );

        health.use(this.authorization.createUnauthorizedErrHandler());

        return health;
    }
}
