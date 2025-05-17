/**
 * Example of calling the script:
 * node server.js --config=path/to/config/app-config/default.config.js
 */

import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata'; // tsyringe requires this to be first line imported
import { config as defaultConfig } from './regular-user/config/app-config/default.config';
import { binder as regularUserIoCBinder } from './regular-user/main/ioc/binders/ioc-binder';
import { initializer as regularUserIoCInitializer } from './regular-user/main/ioc/initializers/ioc-initializer';
import { Application } from './shared/main/app/app';
import { IAppConfig } from './shared/main/app/app-config.interface';

const main = async () => {
    const authApp: express.Express = express();
    const config: IAppConfig = await loadConfig(defaultConfig);
    config.main.di.app = authApp;

    console.log('Loaded configuration:', config);

    // RegularUser Module
    Application.create(config, regularUserIoCBinder, regularUserIoCInitializer)
        .then((app) => app.listenHttp())
        .catch((error) => {
            console.error('Failed to start application:\n', error);
            process.exit(error.code || 1);
        });
};

const loadConfig = async (defaultConfig: IAppConfig): Promise<IAppConfig> => {
    // e.g. --config=./regular-user/config/app-config/test.config.ts
    const confPathRaw = process.env.CONFIG;
    if (!confPathRaw) {
        throw new Error('No config file arg provided!');
    }

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
        // !important try config first as it is in the default config
        return customConfig.config || customConfig.default || customConfig;
    } catch (error) {
        console.error(`Error loading config file: ${(error as Error).message}`);
        console.log('Falling back to default configuration');
        return defaultConfig;
    }
};

main();
