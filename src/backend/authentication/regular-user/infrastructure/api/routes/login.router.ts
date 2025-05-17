import express from 'express';
import { injectable, singleton } from 'tsyringe';
import { RouterRegistry } from './router-registry';
import { LoginController } from '../controllers/login.controller';
import { SanitizationMiddleware } from '../../../../shared/infrastructure/middleware/sanitization.middleware';
import { RequestMetadataMiddleware } from '../../../../shared/infrastructure/middleware/request-metadata.middleware';
import { RequestLoggingMiddleware } from '../../../../shared/infrastructure/middleware/request-logging.middleware';
import { ResponseLoggingMiddleware } from '../../../../shared/infrastructure/middleware/response-logging.middleware';
import { ErrorHandlerMiddleware } from '../../../../shared/infrastructure/middleware/error-handler.middleware';

@singleton()
@injectable()
export class LoginRouter {
    constructor(
        private readonly sanitizationMiddleware: SanitizationMiddleware,
        private readonly requestMetadataMiddleware: RequestMetadataMiddleware,
        private readonly requestLoggingMiddleware: RequestLoggingMiddleware,
        private readonly responseLoggingMiddleware: ResponseLoggingMiddleware,
        private readonly errorHandlerMiddleware: ErrorHandlerMiddleware,
        private readonly loginController: LoginController,
    ) {}

    public registerRoutes(routerRegistry: RouterRegistry): void {
        routerRegistry.registerRouter(`/login`, this.createLoginRouter());
    }

    private createLoginRouter(): express.Router {
        const login = express.Router();

        // Common middleware:
        login.use(this.sanitizationMiddleware.createSanitizeEntireBody());
        login.use(this.requestMetadataMiddleware.createRequestMetadata());
        login.use(this.requestLoggingMiddleware.createLogRequest());
        login.use(this.responseLoggingMiddleware.createLogResponse());

        // Routes:
        login
            .route(``)
            .post((req, res) => this.loginController.login(req, res));

        // Common error handling middleware:
        login.use(this.errorHandlerMiddleware.createHandleUncaughtExceptions());

        return login;
    }
}
