import { injectable, singleton } from 'tsyringe';
import { FeatureIoC } from '../../../../../shared/main/ioc/ioc/ioc-initializer.base';
import { ILoginConfig } from '../../config/login-config.interface';
import { LoginBinder } from '../binders/login.binder';
import { LoginRoutesLoader } from '../routes-loaders/login.routes-loader';

@singleton()
@injectable()
export class LoginIoC extends FeatureIoC<ILoginConfig, void> {
    constructor() {
        super(LoginBinder, [LoginRoutesLoader]);
    }
}
