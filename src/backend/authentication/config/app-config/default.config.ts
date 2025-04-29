import { IAppConfig } from '../../shared/main/app/app-config.interface.ts';

export const config: IAppConfig = {
    server: {
        port: process.env.PORT || 3000,
    },
};
