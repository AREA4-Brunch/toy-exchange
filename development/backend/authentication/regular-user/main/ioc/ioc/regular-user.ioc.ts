import { injectable, singleton } from 'tsyringe';
import { ModuleIoC } from '../../../../shared/main/ioc/ioc/ioc';
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
            (conf: IRegularUserConfig) => conf.api.basePath,
            (_, __, conf: IRegularUserConfig) => [
                [[LoginIoC, conf.features.login]],
                [[HealthIoC, conf.features.health]],
            ],
        );
    }
}
