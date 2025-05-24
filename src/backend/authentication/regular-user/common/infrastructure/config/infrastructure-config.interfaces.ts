import { IRoutesConfig } from '../../../../shared/infrastructure/config/infrastructure-config.interface';
import { IMiddlewareModuleConfig } from '../../../../shared/infrastructure/middleware/module';

export interface IConfigInfrastructure {
    readonly api: {
        readonly routes: IRoutesConfig;
        readonly middleware: IMiddlewareConfig;
    };
}

export interface IMiddlewareConfig extends IMiddlewareModuleConfig {}
