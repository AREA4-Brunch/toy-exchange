import { AuthorizationMiddleware } from 'authorization/dist/infrastructure/middleware';
import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { RequestLoggingMiddleware } from '../../../../shared/presentation/api/middleware/request-logging.middleware';
import { ResponseLoggingMiddleware } from '../../../../shared/presentation/api/middleware/response-logging.middleware';
import { RouterRoot } from '../../../../shared/presentation/api/routes/router-root';
import { IHealthRoutesConfig } from '../config/health.config.interface';
import { HEALTH_PRESENTATION_TYPES } from '../di/health.types';
import { HealthHandler } from './health.handler';

/**
 * @internal - This exists for testing purposes only.
 */
@singleton()
@injectable()
export class TestRoleCheckingRouter extends RouterRoot {
    constructor(
        @inject(HEALTH_PRESENTATION_TYPES.RoutesConfig)
        private readonly routesConfig: IHealthRoutesConfig,
        private readonly healthHandler: HealthHandler,
        private readonly requestLogging: RequestLoggingMiddleware,
        private readonly responseLogging: ResponseLoggingMiddleware,
        private readonly authorization: AuthorizationMiddleware,
    ) {
        super();
    }

    protected getRouters(): { path: string; router: express.Router }[] {
        return !this.routesConfig.testEnabled
            ? []
            : [
                  {
                      path: `${this.routesConfig.testRoleCheckingPath}`,
                      router: this.createTestRouter(),
                  },
              ];
    }

    private createTestRouter() {
        const health = express.Router();
        health.use(this.requestLogging.createLogRequest());
        health.use(this.responseLogging.createLogResponse());

        health
            .route(`/public`)
            .get((req, res) => this.healthHandler.ping(req, res));

        health
            .route(`/authenticated`)
            .get(this.authorization.createRequireLogin(), (req, res) =>
                this.healthHandler.ping(req, res),
            );

        health
            .route(`/single-role`)
            .get(
                this.authorization.createRequireLogin(),
                this.authorization.createRequireRoles({ all: ['test'] }),
                (req, res) => this.healthHandler.ping(req, res),
            );

        health.route(`/multiple-roles-all`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({
                all: ['test', 'test-1'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health.route(`/multiple-roles-some`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({
                some: ['test-some-1', 'test-some-2'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health.route(`/forbidden-roles`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({
                none: ['test-none-1', 'test-none-2'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health.route(`/combined-requirements`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({
                all: ['test', 'test-1'],
                some: ['test-some-1', 'test-some-2'],
                none: ['test-none-1', 'test-none-2'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health.route(`/all-and-some`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({
                all: ['test', 'test-1'],
                some: ['test-some-1', 'test-some-2'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health.route(`/some-and-none`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({
                some: ['test-some-1', 'test-some-2'],
                none: ['test-none-1', 'test-none-2'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health.route(`/all-and-none`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({
                all: ['test', 'test-1'],
                none: ['test-none-1', 'test-none-2'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health.route(`/double-middleware`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({ all: ['test'] }),
            this.authorization.createRequireRoles({
                some: ['test-some-1', 'test-some-2'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health
            .route(`/admin-only`)
            .get(
                this.authorization.createRequireLogin(),
                this.authorization.createRequireRoles({ all: ['test-admin'] }),
                (req, res) => this.healthHandler.ping(req, res),
            );

        health.route(`/super-admin`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({
                all: ['test-admin', 'test-super-admin'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health.route(`/moderator-or-admin`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({
                some: ['test-moderator', 'test-admin'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health.route(`/no-banned-users`).get(
            this.authorization.createRequireLogin(),
            this.authorization.createRequireRoles({
                none: ['banned', 'test-suspended'],
            }),
            (req, res) => this.healthHandler.ping(req, res),
        );

        health.use(this.authorization.createUnauthorizedErrHandler());

        return health;
    }
}
