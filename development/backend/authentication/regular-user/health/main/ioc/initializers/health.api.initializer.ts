import { Router } from 'express';
import { DependencyContainer, inject, injectable, singleton } from 'tsyringe';
import { IInitializer } from '../../../../../shared/main/ioc/initializer.base';
import { HealthRouter } from '../../../presentation/api/health.router';
import { TestRoleCheckingRouter } from '../../../presentation/api/test.role-checking.router';
import { IHealthApiConfig } from '../../../presentation/config/health.config.interface';
import { HEALTH_MAIN_TYPES } from '../../di/health.types';

@singleton()
@injectable()
export class HealthApiInitializer implements IInitializer<IHealthApiConfig> {
    constructor(
        @inject(HEALTH_MAIN_TYPES.RootRouter)
        private readonly root: Router,
        private readonly health: HealthRouter,
        private readonly testRoleChecking: TestRoleCheckingRouter,
    ) {}

    public async initialize(
        _: DependencyContainer,
        config: IHealthApiConfig,
    ): Promise<void> {
        this.health.mount(this.root);

        if (config.routes.testEnabled) {
            this.testRoleChecking.mount(this.root);
        }
    }
}
