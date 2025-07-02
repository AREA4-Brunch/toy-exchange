import { Argon2PasswordVerifier } from 'password-utils/dist/infrastructure/argon2.password-verifier';
import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { IInitializer } from '../../../../../shared/main/ioc/initializer.base';
import { LOGIN_APPLICATION_TYPES } from '../../../application/di/login.types';
import { ILoginApplicationConfig } from '../../../application/ports/config/login.config.interface';
import { IRegularUserAuthRepository } from '../../../application/ports/repositories/regular-user-auth.repository.interface';
import { IPasswordVerifier } from '../../../application/ports/services/password.service.interface';
import { ITokenService } from '../../../application/ports/services/token.service.interface';
import { ILoginInputBoundary } from '../../../application/ports/use-cases/login.use-case.input.interface';
import { ILoginOutputBoundary } from '../../../application/ports/use-cases/login.use-case.output.interface';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { ILoginCoreConfig } from '../../../core/config/login.config.interface';
import { LoginExpressController } from '../../../infrastructure/controllers/login.express.controller';
import { LOGIN_INFRASTRUCTURE_TYPES } from '../../../infrastructure/di/login.types';
import { RegularUserAuthInMemoryRepo } from '../../../infrastructure/persistance/repositories/regular-user-auth.in-mem.repository';
import { ILoginInfrastructureConfig } from '../../../infrastructure/ports/config/login.config.interface';
import { LoginApiPresenter } from '../../../infrastructure/presenters/login.api.presenter';
import {
    ITokenServiceConfig,
    JwtTokenService,
} from '../../../infrastructure/services/jwt.token.service';
import { LoginDtoView } from '../../../presentation/api/views/login.dto.view';
import { LOGIN_PRESENTATION_TYPES } from '../../../presentation/di/login.types';
import { ILoginExpressControllerFactory } from '../../../presentation/ports/api/handlers/login.controller.factory.interface';
import {
    ILoginPresentationConfig,
    ILoginRoutesConfig,
} from '../../../presentation/ports/config/login.config.interface';
import { ILoginConfig } from '../../config/login.config.interface';

@singleton()
@injectable()
export class LoginBinder implements IInitializer<ILoginConfig> {
    public async initialize(
        container: DependencyContainer,
        config: ILoginConfig,
    ): Promise<void> {
        core(container, config.core);
        application(container, config.application);
        infrastructure(container, config.infrastructure);
        presentation(container, config.presentation);
        main(container, config);
    }
}

const core = (
    container: DependencyContainer,
    conf: ILoginCoreConfig,
): void => {};

const application = (
    container: DependencyContainer,
    conf: ILoginApplicationConfig,
): void => {};

const infrastructure = (
    container: DependencyContainer,
    conf: ILoginInfrastructureConfig,
): void => {
    container.registerInstance<ITokenServiceConfig>(
        LOGIN_INFRASTRUCTURE_TYPES.TokenServiceConfig,
        conf.tokenService,
    );
    container.register<ITokenService>(LOGIN_APPLICATION_TYPES.TokenService, {
        useClass: JwtTokenService,
    });
    container.register<IRegularUserAuthRepository>(
        LOGIN_APPLICATION_TYPES.RegularUserAuthRepository,
        {
            useClass: RegularUserAuthInMemoryRepo,
        },
    );
    container.registerSingleton<IPasswordVerifier>(
        LOGIN_APPLICATION_TYPES.PasswordVerifier,
        Argon2PasswordVerifier,
    );
    container.register<ILoginInputBoundary>(
        LOGIN_APPLICATION_TYPES.LoginInputBoundary,
        {
            useClass: LoginUseCase,
        },
    );
};

const presentation = (
    container: DependencyContainer,
    conf: ILoginPresentationConfig,
): void => {
    if (conf.api) {
        container.registerInstance<ILoginRoutesConfig>(
            LOGIN_PRESENTATION_TYPES.RoutesConfig,
            conf.api.routes,
        );

        container.registerInstance<ILoginExpressControllerFactory>(
            LOGIN_PRESENTATION_TYPES.LoginExpressControllerFactory,
            {
                create: (res) => {
                    // relying on controller and use case not being singletons,
                    // this way I do not have to pass all the other args :)
                    const ctx = container.createChildContainer();
                    ctx.registerInstance<ILoginOutputBoundary>(
                        LOGIN_APPLICATION_TYPES.LoginOutputBoundary,
                        new LoginApiPresenter(new LoginDtoView(res)),
                    );
                    return ctx.resolve(LoginExpressController);
                },
            },
        );
    }
};

const main = (container: DependencyContainer, conf: ILoginConfig): void => {};
