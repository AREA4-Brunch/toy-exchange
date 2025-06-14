import { inject, injectable, InjectionToken, singleton } from 'tsyringe';
import { FeatureIoC } from '../../../../../shared/main/ioc/ioc/ioc-initializer.base';
import { HealthRouter } from '../../../infrastructure/api/health.router';
import { TestRoleCheckingRouter } from '../../../infrastructure/api/test.role-checking.router';
import { IHealthRoutesConfig } from '../../../infrastructure/config/health.config.interface';
import { IHealthConfig } from '../../config/health.config.interface';
import { HealthBinder } from '../binders/health.binder';
import { HEALTH_MAIN_TYPES } from '../di/health.types';

@singleton()
@injectable()
export class HealthIoC extends FeatureIoC<IHealthConfig> {
    constructor(
        binder: HealthBinder,
        @inject(HEALTH_MAIN_TYPES.Config) conf: IHealthConfig,
    ) {
        super(
            binder,
            new Map<InjectionToken, string>(
                getRouters(conf.infrastructure.api.routes),
            ),
        );
    }
}

const getRouters = (conf: IHealthRoutesConfig): [InjectionToken, string][] => {
    const routers: [InjectionToken, string][] = [
        [HealthRouter, 'infrastructure.api.routes'],
    ];
    if (conf.testEnabled) {
        routers.push([TestRoleCheckingRouter, 'infrastructure.api.routes']);
    }
    return routers;
};
