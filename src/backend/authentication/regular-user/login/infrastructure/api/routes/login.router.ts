import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { ErrorHandlerMiddleware } from '../../../../../shared/infrastructure/middleware/error-handler.middleware';
import { RequestLoggingMiddleware } from '../../../../../shared/infrastructure/middleware/request-logging.middleware';
import { RequestMetadataMiddleware } from '../../../../../shared/infrastructure/middleware/request-metadata.middleware';
import { RequestValidationMiddleware } from '../../../../../shared/infrastructure/middleware/request-validation.middleware';
import { ResponseLoggingMiddleware } from '../../../../../shared/infrastructure/middleware/response-logging.middleware';
import { SanitizationMiddleware } from '../../../../../shared/infrastructure/middleware/sanitization.middleware';
import { RoutesLoader } from '../../../../../shared/infrastructure/routes/routes-loader.base';
import { ILoginRoutesConfig } from '../../config/login.config.interface';
import { LOGIN_INFRASTRUCTURE_TYPES } from '../../di/login-types';
import { LoginController } from '../controllers/login.controller';
import { loginRequestSchema } from '../request-schemas/login.schema';

@singleton()
@injectable()
export class LoginRouter extends RoutesLoader<ILoginRoutesConfig> {
    constructor(
        @inject(LOGIN_INFRASTRUCTURE_TYPES.RoutesConfig)
        private readonly routesConfig: ILoginRoutesConfig,
        private readonly sanitization: SanitizationMiddleware,
        private readonly requestMetadata: RequestMetadataMiddleware,
        private readonly requestLogging: RequestLoggingMiddleware,
        private readonly responseLogging: ResponseLoggingMiddleware,
        private readonly errorHandler: ErrorHandlerMiddleware,
        private readonly reqValidation: RequestValidationMiddleware,
        private readonly loginController: LoginController,
    ) {
        super();
    }

    protected getRouters(): { path: string; router: express.Router }[] {
        return [
            {
                path: this.routesConfig.apiBasePath,
                router: this.createLoginRouter(),
            },
        ];
    }

    private createLoginRouter(): express.Router {
        const login = express.Router();
        login.use(this.sanitization.createSanitizeEntireBody());
        login.use(this.requestMetadata.createRequestMetadata());
        login.use(this.requestLogging.createLogRequest());
        login.use(this.responseLogging.createLogResponse());

        login
            .route(``)
            .post(
                this.reqValidation.createValidateRequest(loginRequestSchema),
                (req, res) => this.loginController.login(req, res),
            );

        login.use(this.errorHandler.createHandleUncaughtExceptions());
        return login;
    }
}
