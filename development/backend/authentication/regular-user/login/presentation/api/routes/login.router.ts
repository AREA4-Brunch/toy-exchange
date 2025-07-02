import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { RequestLoggingMiddleware } from '../../../../../shared/presentation/api/middleware/request-logging.middleware';
import { RequestMetadataMiddleware } from '../../../../../shared/presentation/api/middleware/request-metadata.middleware';
import { ResponseLoggingMiddleware } from '../../../../../shared/presentation/api/middleware/response-logging.middleware';
import { SanitizationMiddleware } from '../../../../../shared/presentation/api/middleware/sanitization.middleware';
import { RouterRoot } from '../../../../../shared/presentation/api/routes/router-root';
import { LOGIN_PRESENTATION_TYPES } from '../../di/login.types';
import { ILoginRoutesConfig } from '../../ports/config/login.config.interface';
import { LoginHandler } from '../handlers/login.handler';

@singleton()
@injectable()
export class LoginRouter extends RouterRoot {
    constructor(
        @inject(LOGIN_PRESENTATION_TYPES.RoutesConfig)
        private readonly routesConfig: ILoginRoutesConfig,
        private readonly sanitization: SanitizationMiddleware,
        private readonly requestMetadata: RequestMetadataMiddleware,
        private readonly requestLogging: RequestLoggingMiddleware,
        private readonly responseLogging: ResponseLoggingMiddleware,
        private readonly loginHandler: LoginHandler,
    ) {
        super();
    }

    protected getRouters(): { path: string; router: express.Router }[] {
        return [
            {
                path: this.routesConfig.loginBasePath,
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
                this.loginHandler.handle.bind(this.loginHandler),
                this.loginHandler.handleAnyError.bind(this.loginHandler),
            );

        return login;
    }
}
