import { IHealthConfig } from '../../health/main/config/health.config.interface';
import { ILoginConfig } from '../../login/main/config/login.config.interface';

export interface IRegularUserConfig {
    readonly api: {
        readonly basePath: string;
    };
    readonly features: {
        readonly login: ILoginConfig;
        readonly health: IHealthConfig;
    };
}
