import { ILoginApplicationConfig } from '../../application/ports/config/login.config.interface';
import { ILoginCoreConfig } from '../../core/config/login.config.interface';
import { ILoginInfrastructureConfig } from '../../infrastructure/config/login.config.interface';

export interface ILoginConfig {
    readonly core: ILoginCoreConfig;
    readonly application: ILoginApplicationConfig;
    readonly infrastructure: ILoginInfrastructureConfig;
}
