import { IInitializer } from '../../../../shared/main/ioc/initializers/initializer.interface';
import { IocInitializer } from '../../../../shared/main/ioc/initializers/ioc-initializer.base';
import { IAppConfig } from '../../config/app-config.interface';
import { ExpressInitializer } from './express.initializer';

export const initializer = {
    async initialize(config: IAppConfig): Promise<void> {
        const initializers = getInitializers(config);
        initializers.forEach(async (initializer) => {
            await initializer.init();
        });
    },
} as IocInitializer<IAppConfig>;

const getInitializers = (config: IAppConfig): IInitializer[] => {
    const container = config.main.di.container;
    return [container.resolve<ExpressInitializer>(ExpressInitializer)];
};
