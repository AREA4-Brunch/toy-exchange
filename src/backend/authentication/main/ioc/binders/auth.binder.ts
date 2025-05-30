import { AuthorizationModule } from 'authorization';
import { AuthorizationMiddleware } from 'authorization/dist/authorization/middleware';
import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { ErrorHandlerMiddleware } from '../../../shared/infrastructure/middleware/error-handler.middleware';
import { MiddlewareModule } from '../../../shared/infrastructure/middleware/module';
import { RequestLoggingMiddleware } from '../../../shared/infrastructure/middleware/request-logging.middleware';
import { RequestMetadataMiddleware } from '../../../shared/infrastructure/middleware/request-metadata.middleware';
import { RequestValidationMiddleware } from '../../../shared/infrastructure/middleware/request-validation.middleware';
import { ResponseLoggingMiddleware } from '../../../shared/infrastructure/middleware/response-logging.middleware';
import { SanitizationMiddleware } from '../../../shared/infrastructure/middleware/sanitization.middleware';
import { IIoCBinder } from '../../../shared/main/ioc/binders/ioc-binder.interface';
import {
    IAuthenticationConfig,
    ISharedConfig,
} from '../../config/auth-config.interface';

@singleton()
@injectable()
export class AuthenticationBinder implements IIoCBinder<IAuthenticationConfig> {
    public bind(
        authenticationContainer: DependencyContainer,
        config: IAuthenticationConfig,
    ) {
        shared(authenticationContainer, config.shared);
    }
}

const shared = (container: DependencyContainer, conf: ISharedConfig) => {
    const middleware = new MiddlewareModule(conf.middleware);

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

    const authorization = new AuthorizationModule(conf.authorization);

    container.registerInstance(
        AuthorizationMiddleware,
        authorization.authorizationMiddleware,
    );
};
