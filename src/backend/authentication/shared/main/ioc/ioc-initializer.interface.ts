import { IAppConfig } from '../app/app-config.interface.ts';

export interface IIocInitializer {
    initialize: (config: IAppConfig) => Promise<void>;
}
