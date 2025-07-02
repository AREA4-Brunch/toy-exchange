import { ILoginApplicationConfig } from '../../application/ports/config/login.config.interface';
import { ILoginCoreConfig } from '../../core/config/login.config.interface';
import { ILoginInfrastructureConfig } from '../../infrastructure/ports/config/login.config.interface';
import { ILoginPresentationConfig } from '../../presentation/ports/config/login.config.interface';

export interface ILoginConfig {
    core: ILoginCoreConfig;
    application: ILoginApplicationConfig;
    infrastructure: ILoginInfrastructureConfig;
    presentation: ILoginPresentationConfig;
}
