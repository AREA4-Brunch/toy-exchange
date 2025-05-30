import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { IIoCBinder } from '../../../../../shared/main/ioc/binders/ioc-binder.interface';
import { IConfigLoginApplication } from '../../../application/config/login-config.interface';
import { LOGIN_APPLICATION_TYPES } from '../../../application/di/login-application.types';
import { ITokenServiceConfig } from '../../../application/services/token.service';
import { ILoginUseCase } from '../../../application/use-cases/login.interfaces';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { IConfigLoginCore } from '../../../core/config/login-config.interface';
import {
    ILoginInfrastructureConfig,
    ILoginRoutesConfig,
} from '../../../infrastructure/config/login-config.interface';
import { LOGIN_INFRASTRUCTURE_TYPES } from '../../../infrastructure/di/login-types';
import { ILoginConfig } from '../../config/login-config.interface';

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
    container.registerInstance<ITokenServiceConfig>(
        LOGIN_APPLICATION_TYPES.TokenServiceConfig,
        conf.tokenService,
    );
};

const infrastructure = (
    container: DependencyContainer,
    conf: ILoginInfrastructureConfig,
): void => {
    container.registerInstance<ILoginRoutesConfig>(
        LOGIN_INFRASTRUCTURE_TYPES.RoutesConfig,
        conf.api.routes,
    );
};

const main = (
    container: DependencyContainer,
    conf: IConfigLoginCore,
): void => {};
