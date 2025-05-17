import { IMiddlewareConfig } from '../api/middleware/middleware-config.interface';
import { IRoutesConfig } from '../api/routes/routes-config.interface';

export interface IConfigInfrastructure {
    readonly api: {
        readonly routes: IRoutesConfig;
        readonly middleware: IMiddlewareConfig;
    };
}
