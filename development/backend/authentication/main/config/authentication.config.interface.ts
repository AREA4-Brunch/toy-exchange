import { IRegularUserConfig } from '../../regular-user/main/config/regular-user.config.interface';
import { IAppConfig } from '../../shared/main/config/app.config.interface';
import { IMiddlewareModuleConfig } from '../../shared/presentation/api/middleware/module';

export interface IAuthenticationConfig extends IAppConfig {
    presentation: {
        api?: {
            basePath: string;
        };
    };
    shared: ISharedConfig;
    features: {
        regularUser: IRegularUserConfig;
    };
}

export interface ISharedConfig {
    authorization: {
        jwtSecretKey: string;
    };
    presentation: {
        api?: {
            middleware: IMiddlewareModuleConfig;
        };
    };
}
