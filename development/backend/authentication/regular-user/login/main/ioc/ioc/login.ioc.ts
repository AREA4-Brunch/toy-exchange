import { injectable, singleton } from 'tsyringe';
import { FeatureIoC } from '../../../../../shared/main/ioc/ioc/ioc';
import { LoginRouter } from '../../../infrastructure/api/routes/login.router';
import { ILoginConfig } from '../../config/login.config.interface';
import { LoginBinder } from '../binders/login.binder';

@singleton()
@injectable()
export class LoginIoC extends FeatureIoC<ILoginConfig> {
    constructor(binder: LoginBinder) {
        super(binder, (_, __, conf: ILoginConfig) => [
            [[LoginRouter, conf.infrastructure.api.routes]],
        ]);
    }
}
