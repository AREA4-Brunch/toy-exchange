import { IPasswordService } from 'authentication-interfaces/dist/regular-user/login/application/services/password.service.interface';
import { Argon2PasswordVerifier } from 'password-utils/dist/infrastructure/argon2.password-verifier';
import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { IIoCBinder } from '../../../../../shared/main/ioc/binders/ioc-binder.interface';
import { LOGIN_APPLICATION_TYPES } from '../../../application/di/login.types';
import { IConfigLoginApplication } from '../../../application/ports/config/login.config.interface';
import { IRegularUserRepository } from '../../../application/ports/repositories/regular-user.repository.interface';
import { ITokenService } from '../../../application/ports/services/token.service.interface';
import { ILoginUseCase } from '../../../application/ports/use-cases/login.use-case.interface';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { IConfigLoginCore } from '../../../core/config/login.config.interface';
import {
    ILoginInfrastructureConfig,
    ILoginRoutesConfig,
} from '../../../infrastructure/config/login.config.interface';
import { LOGIN_INFRASTRUCTURE_TYPES } from '../../../infrastructure/di/login.types';
import { RegularUserInMemoryRepo } from '../../../infrastructure/persistance/repositories/regular-user.in-mem.repository';
import {
    ITokenServiceConfig,
    JwtTokenService,
} from '../../../infrastructure/services/jwt.token.service';
import { ILoginConfig } from '../../config/login.config.interface';

@singleton()
@injectable()
export class LoginBinder implements IIoCBinder<ILoginConfig> {
    public bind(container: DependencyContainer, config: ILoginConfig): void {
        core(container, config.core);
        application(container, config.application);
        infrastructure(container, config.infrastructure);
        main(container, config);
    }
}

const core = (
    container: DependencyContainer,
    conf: IConfigLoginCore,
): void => {};

const application = (
    container: DependencyContainer,
    conf: IConfigLoginApplication,
): void => {
    container.register<ILoginUseCase>(LOGIN_APPLICATION_TYPES.LoginUseCase, {
        useClass: LoginUseCase,
    });
};

const infrastructure = (
    container: DependencyContainer,
    conf: ILoginInfrastructureConfig,
): void => {
    container.registerInstance<ILoginRoutesConfig>(
        LOGIN_INFRASTRUCTURE_TYPES.RoutesConfig,
        conf.api.routes,
    );
    container.registerInstance<ITokenServiceConfig>(
        LOGIN_INFRASTRUCTURE_TYPES.TokenServiceConfig,
        conf.tokenService,
    );
    container.register<ITokenService>(LOGIN_APPLICATION_TYPES.TokenService, {
        useClass: JwtTokenService,
    });
    container.register<IPasswordService>(
        LOGIN_APPLICATION_TYPES.PasswordService,
        {
            useClass: Argon2PasswordVerifier,
        },
    );
    container.register<IRegularUserRepository>(
        LOGIN_APPLICATION_TYPES.RegularUserRepository,
        {
            useClass: RegularUserInMemoryRepo,
        },
    );
};

const main = (container: DependencyContainer, conf: ILoginConfig): void => {};
