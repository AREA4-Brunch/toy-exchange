import { Router } from 'express';
import {
    DependencyContainer,
    injectable,
    InjectionToken,
    singleton,
} from 'tsyringe';
import { RoutesLoader } from '../../../../../shared/infrastructure/routes/routes-loader.base';
import { FeatureIoC } from '../../../../../shared/main/ioc/ioc/ioc';
import { HealthRouter } from '../../../infrastructure/api/health.router';
import { TestRoleCheckingRouter } from '../../../infrastructure/api/test.role-checking.router';
import { IHealthRoutesConfig } from '../../../infrastructure/config/health.config.interface';
import { IHealthConfig } from '../../config/health.config.interface';
import { HealthBinder } from '../binders/health.binder';

@singleton()
@injectable()
export class HealthIoC extends FeatureIoC<IHealthConfig> {
    constructor(binder: HealthBinder) {
        super(binder, getRouters);
    }
}

const getRouters = (
    container: DependencyContainer,
    router: Router,
    config: IHealthConfig,
): [InjectionToken<RoutesLoader<any>>, string][][] => {
    const conf: IHealthRoutesConfig = config.infrastructure.api.routes;
    const routers: [InjectionToken<RoutesLoader<any>>, any][][] = [
        [[HealthRouter, conf]],
    ];
    if (conf.testEnabled) {
        routers.push([[TestRoleCheckingRouter, conf]]);
    }
    return routers;
};
