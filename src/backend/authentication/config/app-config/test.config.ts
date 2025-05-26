import { IAuthenticationConfig } from '../../main/config/auth-config.interface';
import { config as devConfig } from './dev.config';

export const config: IAuthenticationConfig = {
    ...devConfig,
    server: {
        ...devConfig.server,
        http: {
            ...devConfig.server.http,
            port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
        },
    },
};
