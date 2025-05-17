import express from 'express';
import { injectable, singleton } from 'tsyringe';
import { ErrorHandlerMiddleware } from '../../../../shared/infrastructure/middleware/error-handler.middleware';
import { RequestLoggingMiddleware } from '../../../../shared/infrastructure/middleware/request-logging.middleware';
import { RequestMetadataMiddleware } from '../../../../shared/infrastructure/middleware/request-metadata.middleware';
import { ResponseLoggingMiddleware } from '../../../../shared/infrastructure/middleware/response-logging.middleware';
import { SanitizationMiddleware } from '../../../../shared/infrastructure/middleware/sanitization.middleware';
import { LoginController } from '../controllers/login.controller';

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

    public getRouters(): { path: string; router: express.Router }[] {
        return [{ path: `/login`, router: this.createLoginRouter() }];
    }

    private createLoginRouter(): express.Router {
        const login = express.Router();

        login.use(this.sanitizationMiddleware.createSanitizeEntireBody());
        login.use(this.requestMetadataMiddleware.createRequestMetadata());
        login.use(this.requestLoggingMiddleware.createLogRequest());
        login.use(this.responseLoggingMiddleware.createLogResponse());

        login
            .route(``)
            .post((req, res) => this.loginController.login(req, res));

        login.use(this.errorHandlerMiddleware.createHandleUncaughtExceptions());

        return login;
    }
}
