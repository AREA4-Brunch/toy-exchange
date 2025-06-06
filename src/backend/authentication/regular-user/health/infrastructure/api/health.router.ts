import { AuthorizationMiddleware } from 'authorization/dist/infrastructure/middleware';
import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { RequestLoggingMiddleware } from '../../../../shared/infrastructure/middleware/request-logging.middleware';
import { IHealthRoutesConfig } from '../config/health.config.interface';
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
        const routers = [
            {
                path: this.routesConfig.apiBasePath,
                router: this.createHealthRouter(),
            },
        ];
        if (this.routesConfig.testEnabled) {
            routers.push({
                path: `${this.routesConfig.apiBasePath}/test`,
                router: this.createTestRouter(),
            });
        }
        return routers;
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
        health.use(this.authorization.createRequireLogin());
        health.use(this.authorization.createRequireRoles({ all: ['test'] }));
        health
            .route(``)
            .get((req, res) => this.healthController.ping(req, res));

        health.route(`/some-role`).get(
            this.authorization.createRequireRoles({
                some: ['test-some-1', 'test-some-2'],
            }),
            (req, res) => this.healthController.ping(req, res),
        );

        health.route(`/multiple-roles`).get(
            this.authorization.createRequireRoles({
                all: ['test', 'test-1'],
                some: ['test-some-1', 'test-some-2'],
            }),
            (req, res) => this.healthController.ping(req, res),
        );

        health.route(`/forbidden-roles`).get(
            this.authorization.createRequireRoles({
                all: ['test', 'test-1'],
                some: ['test-some-1', 'test-some-2'],
                none: ['test-none-1', 'test-none-2'],
            }),
            (req, res) => this.healthController.ping(req, res),
        );

        health.use(this.authorization.createUnauthorizedErrHandler());

        return health;
    }
}
