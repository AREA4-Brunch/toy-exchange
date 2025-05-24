/**
 * Example of calling the script:
 *    set APP_CONFIG=path/to/config/app-config/default.config.js
 * && node server.js
 */

import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata'; // tsyringe requires this to be first line imported
import { container, DependencyContainer } from 'tsyringe';
import { config as defaultConfig } from './config/app-config/dev.config';
import { IAuthenticationConfig } from './main/config/auth-config.interface';
import { AuthenticationBinder } from './main/ioc/binders/auth.binder';
import { AuthenticationInitializer } from './main/ioc/initializers/auth.initializer';

const main = async (): Promise<void> => {
    const authContainer = container;
    const authApp: express.Express = express();
    const config: IAuthenticationConfig =
        await loadConfigFromFile(defaultConfig);
    console.log(`Loaded configuration:\n${JSON.stringify(config, null, 2)}`);

    initApp(authContainer, authApp, config);

    const serverConfig = config.server;
    authApp.listen(serverConfig.http.port, serverConfig.http.hostname, () =>
        console.log(`App is listening on port ${serverConfig.http.port}`),
    );
};

const loadConfigFromFile = async (
    fallbackConfig: IAuthenticationConfig,
): Promise<IAuthenticationConfig> => {
    const confPathRaw = process.env.APP_CONFIG;
    if (!confPathRaw) {
        return fallbackConfig;
    }

    try {
        const confPath = path.isAbsolute(confPathRaw)
            ? confPathRaw
            : path.resolve(process.cwd(), confPathRaw);

        console.log(`Loading configuration from: ${confPath}`);
        if (!fs.existsSync(confPath)) {
            console.warn(`Config file not found, using default config`);
            return fallbackConfig;
        }
        const customConfig = await import(confPath);
        // !important try config first as it is in the default config
        return customConfig.config || customConfig.default || customConfig;
    } catch (error) {
        console.error(`Error loading config file: ${(error as Error).message}`);
        console.log('Falling back to default configuration');
        return fallbackConfig;
    }
};

const initApp = (
    rootContainer: DependencyContainer,
    app: express.Router,
    config: IAuthenticationConfig,
) => {
    rootContainer.resolve(AuthenticationBinder).bind(rootContainer, config);
    rootContainer
        .resolve(AuthenticationInitializer)
        .initialize(rootContainer, app, config);
};

main();
