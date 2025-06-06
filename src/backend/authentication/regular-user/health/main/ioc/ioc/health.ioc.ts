import { injectable, InjectionToken, singleton } from 'tsyringe';
import { FeatureIoC } from '../../../../../shared/main/ioc/ioc/ioc-initializer.base';
import { HealthRouter } from '../../../infrastructure/api/health.router';
import { IHealthConfig } from '../../config/health.config.interface';
import { HealthBinder } from '../binders/health.binder';

@singleton()
@injectable()
export class HealthIoC extends FeatureIoC<IHealthConfig> {
    constructor(binder: HealthBinder) {
        super(
            binder,
            new Map<InjectionToken, string>([
                [HealthRouter, 'infrastructure.api.routes'],
            ]),
        );
    }
}
