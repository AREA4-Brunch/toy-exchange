import { injectable, singleton } from 'tsyringe';
import { FeatureIoC } from '../../../../../shared/main/ioc/ioc/ioc-initializer.base';
import { IHealthConfig } from '../../config/health-config.interface';
import { HealthBinder } from '../binders/health.binder';
import { HealthRoutesLoader } from '../routes-loaders/health.routes-loader';

@singleton()
@injectable()
export class HealthIoC extends FeatureIoC<IHealthConfig, void> {
    constructor() {
        super(HealthBinder, [HealthRoutesLoader]);
    }
}
