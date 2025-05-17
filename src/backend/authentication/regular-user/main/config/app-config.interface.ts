import { IAppConfig as IAppConfigBase } from '../../../shared/main/app/app-config.interface';
import { IConfigApplication } from '../../application/config/application-config.interface';
import { IConfigCore } from '../../core/config/core-config.interface';
import { IConfigInfrastructure } from '../../infrastructure/config/infrastructure-config.interface';

export interface IAppConfig extends IAppConfigBase {
    readonly core: IConfigCore;
    readonly application: IConfigApplication;
    readonly infrastructure: IConfigInfrastructure;
}
