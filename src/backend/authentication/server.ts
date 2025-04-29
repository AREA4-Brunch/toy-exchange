/**
 * Example of calling the script:
 * node server.js --config=path/to/config/app-config/default.config.js
 */

import { Application } from './shared/main/app/app.ts';
import { IAppConfig } from './shared/main/app/app-config.interface.ts';
import { config as defaultConfig } from './config/app-config/default.config.ts';
import { Container } from 'inversify';
import { binder as regularUserIoCBinder } from './regular-user/main/ioc/ioc-binder.ts';
import { initializer as regularUserIoCInitializer } from './regular-user/main/ioc/ioc-initializer.ts';
import express from 'express';
import * as path from 'path';
import * as fs from 'fs';

const authContainer: Container = new Container();
const authApp: express.Express = express();
const authAppBindKey = '_Auth_App_';
const config: IAppConfig = await loadConfig(defaultConfig);

// RegularUser Module
Application.createUnsafe(
    config,
    regularUserIoCBinder,
    regularUserIoCInitializer,
    authContainer,
    authApp,
    authAppBindKey,
)
    .then((app) => app.listenHttp())
    .catch((error) => {
        console.error('Failed to start application:\n', error);
        process.exit(error.code || 1);
    });

async function loadConfig(defaultConfig: IAppConfig): Promise<IAppConfig> {
    // e.g. --config=path/to/config.ts
    const configArg = process.argv.find((arg) => arg.startsWith('--config='));
    if (!configArg) {
        console.log('No config file arg provided, using default configuration');
        return defaultConfig;
    }
    const confPathRaw = configArg.split('=')[1];

    try {
        const confPath = path.isAbsolute(confPathRaw)
            ? confPathRaw
            : path.resolve(process.cwd(), confPathRaw);

        console.log(`Loading configuration from: ${confPath}`);
        if (!fs.existsSync(confPath)) {
            console.warn(`Config file not found, using default config`);
            return defaultConfig;
        }
        const customConfig = await import(confPath);
        return customConfig.default || customConfig.config || customConfig;
    } catch (error) {
        console.error(`Error loading config file: ${(error as Error).message}`);
        console.log('Falling back to default configuration');
        return defaultConfig;
    }
}
