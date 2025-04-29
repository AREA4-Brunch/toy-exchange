import { IAppConfig } from '../../../shared/main/app/app-config.interface.ts';
import { IIocInitializer } from '../../../shared/main/ioc/ioc-initializer.interface.ts';
import { ILoader } from '../../../shared/main/loaders/loader.interface.ts';

export const initializer: IIocInitializer = {
    initialize: async (config: IAppConfig): Promise<void> => {
        const loaders: ILoader[] = [];
        loaders.forEach(async (loader) => loader.load());
    },
};
