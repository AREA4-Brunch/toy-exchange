/**
 * Example of calling the script:
 *    set APP_CONFIG=path/to/config/app-config/local.config.js
 * && node server.js
 * or
js * node.server.js ./dist/config/app-config/test.config.js
 */

import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata'; // tsyringe requires this to be first line imported
import { container, DependencyContainer } from 'tsyringe';
import defaultConfig from './config/app-config/dev.config';
import { IAuthenticationConfig } from './main/config/authentication.config.interface';
import { AUTHENTICATION_TYPES } from './main/di/authentication.types';
import { AuthenticationIoC } from './main/ioc/ioc/authentication.ioc';

const main = async (): Promise<void> => {
    const config: IAuthenticationConfig = await loadConfFromFile(defaultConfig);
    console.info(`Loaded configuration:`, JSON.stringify(config, null, 2));

    const authApp: express.Express = express();
    await initApp(container, authApp, config);

    authApp
        .listen(config.server.http.port, config.server.http.hostname, () =>
            console.info(`App is listening on port ${config.server.http.port}`),
        )
        .on('error', (error: Error) => {
            console.error(`Error starting server:`, error);
            process.exit(1);
        });
};

const initApp = (
    rootContainer: DependencyContainer,
    app: express.Router,
    config: IAuthenticationConfig,
): Promise<void> => {
    rootContainer.registerInstance<express.Router>(
        AUTHENTICATION_TYPES.RootRouter,
        app,
    );
    return rootContainer
        .resolve(AuthenticationIoC)
        .initialize(rootContainer, config);
};

const loadConfFromFile = async (
    fallbackConfig: IAuthenticationConfig,
): Promise<IAuthenticationConfig> => {
    const confPathRaw =
        process.argv.length >= 3 ? process.argv[2] : process.env.APP_CONFIG;

    if (!confPathRaw) {
        return fallbackConfig;
    }

    try {
        const confPath = path.isAbsolute(confPathRaw)
            ? confPathRaw
            : path.resolve(process.cwd(), confPathRaw);

        console.info(`Loading configuration from: ${confPath}`);
        if (!fs.existsSync(confPath)) {
            console.warn(`Config file not found, using default config`);
            return fallbackConfig;
        }
        const customConfig = await import(confPath);
        return customConfig.default || customConfig;
    } catch (error) {
        console.error(`Error loading config file: ${(error as Error).message}`);
        console.info('Falling back to default configuration');
        return fallbackConfig;
    }
};

if (require.main === module) {
    main();
}
