import { AuthorizationMiddleware } from 'authorization/dist/infrastructure/middleware';
import { AuthorizationModule } from 'authorization/dist/infrastructure/module';
import cors from 'cors';
import express, { Router } from 'express';
import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { REGULAR_USER_TYPES } from '../../../regular-user/main/di/regular-user.types';
import { IInitializer } from '../../../shared/main/ioc/initializer.base';
import { ErrorHandlerMiddleware } from '../../../shared/presentation/api/middleware/error-handler.middleware';
import { MiddlewareModule } from '../../../shared/presentation/api/middleware/module';
import { RequestLoggingMiddleware } from '../../../shared/presentation/api/middleware/request-logging.middleware';
import { RequestMetadataMiddleware } from '../../../shared/presentation/api/middleware/request-metadata.middleware';
import { RequestValidationMiddleware } from '../../../shared/presentation/api/middleware/request-validation.middleware';
import { ResponseLoggingMiddleware } from '../../../shared/presentation/api/middleware/response-logging.middleware';
import { SanitizationMiddleware } from '../../../shared/presentation/api/middleware/sanitization.middleware';
import {
    IAuthenticationConfig,
    ISharedConfig,
} from '../../config/authentication.config.interface';
import { AUTHENTICATION_TYPES } from '../../di/authentication.types';

@singleton()
@injectable()
export class AuthenticationPresentationInit
    implements IInitializer<IAuthenticationConfig>
{
    private callbacks: (() => void)[] = [];

    public async initialize(
        authenticationContainer: DependencyContainer,
        config: IAuthenticationConfig,
    ) {
        if (config.presentation.api) {
            this.setupApiPresentation(authenticationContainer, config);
        }
    }

    /** Call after all features are initialized. */
    public callback(): void {
        this.callbacks.forEach((callback) => callback());
    }

    /**
     * Returns callback needed to load common error handlers, call only after all
     * features are initialized.
     */
    private setupApiPresentation(
        container: DependencyContainer,
        config: IAuthenticationConfig,
    ): void {
        const childRouter: Router = Router();
        const root = container.resolve<Router>(AUTHENTICATION_TYPES.RootRouter);
        root.use(cors());
        root.use(express.json());
        root.use(config.presentation.api!.basePath, childRouter);

        if (config.features.regularUser.presentation.api) {
            container.registerInstance<Router>(
                REGULAR_USER_TYPES.RootRouter,
                childRouter,
            );
        }

        if (config.shared.presentation.api) {
            this.setupSharedApiMiddleware(
                container,
                config.shared,
                childRouter,
            );
        }
    }

    private setupSharedApiMiddleware(
        container: DependencyContainer,
        config: ISharedConfig,
        childRouter: Router,
    ): void {
        const middleware = new MiddlewareModule(
            config.presentation.api!.middleware,
        );

        container.registerInstance(
            SanitizationMiddleware,
            middleware.sanitizationMiddleware,
        );

        container.registerInstance(
            RequestMetadataMiddleware,
            middleware.requestMetadataMiddleware,
        );

        container.registerInstance(
            RequestLoggingMiddleware,
            middleware.requestLoggingMiddleware,
        );

        container.registerInstance(
            ResponseLoggingMiddleware,
            middleware.responseLoggingMiddleware,
        );

        container.registerInstance(
            ErrorHandlerMiddleware,
            middleware.errorHandlerMiddleware,
        );

        container.registerInstance(
            RequestValidationMiddleware,
            middleware.requestValidationMiddleware,
        );

        const authorization = new AuthorizationModule(config.authorization);

        container.registerInstance(
            AuthorizationMiddleware,
            authorization.authorizationMiddleware,
        );

        // !important: must be loaded after features have loaded their routers
        const loadErrorHandlingMiddleware = () => {
            const fallback = container.resolve(ErrorHandlerMiddleware);
            childRouter.use(fallback.createHandleUncaughtExceptions());
        };

        this.callbacks.push(loadErrorHandlingMiddleware);
    }
}
