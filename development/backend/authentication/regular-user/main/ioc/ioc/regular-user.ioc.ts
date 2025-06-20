import { injectable, InjectionToken, singleton } from 'tsyringe';
import { ModuleIoC } from '../../../../shared/main/ioc/ioc/ioc-initializer.base';
import { HealthIoC } from '../../../health/main/ioc/ioc/health.ioc';
import { LoginIoC } from '../../../login/main/ioc/ioc/login.ioc';
import { IRegularUserConfig } from '../../config/app.config.interface';
import { RegularUserBinder } from '../binders/regular-user.binder';

@singleton()
@injectable()
export class RegularUserIoC extends ModuleIoC<IRegularUserConfig> {
    constructor(binder: RegularUserBinder) {
        super(
            binder,
            'api.basePath',
            new Map<InjectionToken, string>([
                [LoginIoC, 'features.login'],
                [HealthIoC, 'features.health'],
            ]),
        );
    }
}
