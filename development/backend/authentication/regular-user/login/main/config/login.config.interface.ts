import { IConfigLoginApplication } from '../../application/ports/config/login.config.interface';
import { IConfigLoginCore } from '../../core/config/login.config.interface';
import { ILoginInfrastructureConfig } from '../../infrastructure/config/login.config.interface';

export interface ILoginConfig {
    readonly core: IConfigLoginCore;
    readonly application: IConfigLoginApplication;
    readonly infrastructure: ILoginInfrastructureConfig;
}
