import { container } from 'tsyringe';
import { IAppConfig } from '../../main/config/app-config.interface.js';
import { MAIN_TYPES } from '../../../shared/main/di/types.js';

export const config: IAppConfig = {
    core: {},
    application: {},
    infrastructure: {
        api: {
            routes: {
                apiBasePath: '/api/v1/auth/regular-user',
                staticBasePath: '/static',
                staticContent: [],
            },
            middleware: {
                sanitization: {
                    logger: console,
                },
                requestLogging: {
                    logger: console,
                    logLevel: 'detailed',
                    fieldsToRedact: ['password', 'token'],
                },
                responseLogging: {
                    logger: console,
                },
                errorHandler: {
                    logger: console,
                },
            },
        },
    },
    main: {
        di: {
            app: undefined,
            appBindSymbol: MAIN_TYPES.App,
            container: container,
        },
    },
    // configuration of the execuction environment
    server: {
        port: process.env.PORT ? parseInt(process.env.PORT) : 4000,
        hostname: process.env.HOSTNAME || '0.0.0.0',
    },
};
