import { Router } from 'express';
import { DependencyContainer, inject, injectable, singleton } from 'tsyringe';
import { IInitializer } from '../../../../../shared/main/ioc/initializer.base';
import { LoginRouter } from '../../../presentation/api/routes/login.router';
import { ILoginApiConfig } from '../../../presentation/ports/config/login.config.interface';
import { LOGIN_MAIN_TYPES } from '../../di/login.types';

@singleton()
@injectable()
export class LoginApiInitializer implements IInitializer<ILoginApiConfig> {
    constructor(
        @inject(LOGIN_MAIN_TYPES.RootRouter)
        private readonly root: Router,
        private readonly login: LoginRouter,
    ) {}

    public async initialize(
        _: DependencyContainer,
        config: ILoginApiConfig,
    ): Promise<void> {
        this.login.mount(this.root);
    }
}
