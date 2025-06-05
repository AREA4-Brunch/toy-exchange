import { IRegularUserConfig } from '../../regular-user/main/config/app.config.interface';
import { IMiddlewareModuleConfig } from '../../shared/infrastructure/middleware/module';
import { IAppConfig } from '../../shared/main/app/app.config.interface';

export interface IAuthenticationConfig extends IAppConfig {
    readonly api: {
        readonly basePath: string;
    };
    readonly regularUser: IRegularUserConfig;
    readonly shared: ISharedConfig;
}

export interface ISharedConfig {
    readonly middleware: IMiddlewareModuleConfig;
    readonly authorization: {
        readonly jwtSecretKey: string;
    };
}
