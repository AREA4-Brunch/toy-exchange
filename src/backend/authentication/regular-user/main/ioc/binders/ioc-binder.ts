/**
 * For binding instances whose constructor requires configuration.
 */

import express from 'express';
import { DependencyContainer } from 'tsyringe';
import { ErrorHandlerMiddleware } from '../../../../shared/infrastructure/middleware/error-handler.middleware';
import { MiddlewareModule } from '../../../../shared/infrastructure/middleware/module';
import { RequestLoggingMiddleware } from '../../../../shared/infrastructure/middleware/request-logging.middleware';
import { RequestMetadataMiddleware } from '../../../../shared/infrastructure/middleware/request-metadata.middleware';
import { RequestValidationMiddleware } from '../../../../shared/infrastructure/middleware/request-validation.middleware';
import { ResponseLoggingMiddleware } from '../../../../shared/infrastructure/middleware/response-logging.middleware';
import { SanitizationMiddleware } from '../../../../shared/infrastructure/middleware/sanitization.middleware';
import { IocBinder } from '../../../../shared/main/ioc/binders/ioc-binder.base';
import { IConfigApplication } from '../../../application/config/application-config.interface';
import { APPLICATION_TYPES } from '../../../application/di/types';
import { ILoginUseCase } from '../../../application/use-cases/login.interfaces';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { IConfigCore } from '../../../core/config/core-config.interface';
import { IMiddlewareConfig } from '../../../infrastructure/api/middleware/middleware-config.interface';
import { IConfigInfrastructure } from '../../../infrastructure/config/infrastructure-config.interface';
import { INFRASTRUCTURE_TYPES } from '../../../infrastructure/di/types';
import { IAppConfig } from '../../config/app-config.interface';

const core = (container: DependencyContainer, conf: IConfigCore): void => {};

const application = (
    container: DependencyContainer,
    conf: IConfigApplication,
): void => {
    container.register<ILoginUseCase>(APPLICATION_TYPES.LoginUseCase, {
        useClass: LoginUseCase,
    });
};

const infrastructure = (
    container: DependencyContainer,
    conf: IConfigInfrastructure,
): void => {
    container.registerInstance(INFRASTRUCTURE_TYPES.ConfigInfrastructure, conf);
    bindMiddleware(container, conf.api.middleware);
};

const main = (container: DependencyContainer, conf: IAppConfig): void => {
    if (!conf.main.di.app) {
        throw new Error(`express.Express app must be provided in the config.`);
    }
    if (!conf.main.di.appBindSymbol) {
        throw new Error(`appBindSymbol must be provided in the config.`);
    }

    container.registerInstance<express.Express>(
        conf.main.di.appBindSymbol,
        conf.main.di.app,
    );
};

export const binder = {
    bind(container: DependencyContainer, config: IAppConfig): void {
        // const coreContainer = container.createChildContainer();
        // const applicationContainer = coreContainer.createChildContainer();
        // const infrastructureContainer =
        //     applicationContainer.createChildContainer();
        // const mainContainer = infrastructureContainer.createChildContainer();

        // core(coreContainer, config.core);
        // application(applicationContainer, config.application);
        // infrastructure(infrastructureContainer, config.infrastructure);
        // main(mainContainer, config);

        core(container, config.core);
        application(container, config.application);
        infrastructure(container, config.infrastructure);
        main(container, config);
    },
} as IocBinder<IAppConfig>;

const bindMiddleware = (
    container: DependencyContainer,
    conf: IMiddlewareConfig,
) => {
    const middleware = new MiddlewareModule(conf);

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
};
