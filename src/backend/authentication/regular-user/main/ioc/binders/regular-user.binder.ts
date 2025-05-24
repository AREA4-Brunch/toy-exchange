import { DependencyContainer, injectable, singleton } from 'tsyringe';
import { IIoCBinder } from '../../../../shared/main/ioc/binders/ioc-binder.interface';
import { IRegularUserConfig } from '../../config/app-config.interface';

@singleton()
@injectable()
export class RegularUserBinder implements IIoCBinder<IRegularUserConfig> {
    public async bind(
        container: DependencyContainer,
        config: IRegularUserConfig,
    ): Promise<void> {}
}
