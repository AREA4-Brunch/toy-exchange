import { IHealthConfig } from '../../health/main/config/health.config.interface';
import { ILoginConfig } from '../../login/main/config/login.config.interface';

export interface IRegularUserConfig {
    presentation: {
        api?: {
            basePath: string;
        };
    };
    features: {
        login: ILoginConfig;
        health: IHealthConfig;
    };
}
