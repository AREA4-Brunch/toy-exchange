import waitOn from 'wait-on';
import * as path from 'path';
import * as fs from 'fs';
import { IAppConfig } from '../../../../src/backend/authentication/regular-user/main/config/app-config.interface';

let config: IAppConfig | undefined;

export const getApiBasePath = async (): Promise<string> => {
    const config = await getConfig();
    const host = getHostname(config);
    return `${host}:${config.server.port}${config.infrastructure.api.routes.apiBasePath}`;
};

export const generateTestCredentials = () => {
    return {
        email: 'test@example.com',
        password: 'password123',
    };
};

export const startTestServer = async () => {
    const basePath = await getApiBasePath();
    console.log(`Pinging the test server... http-get://${basePath}/health`);
    await waitOn({
        resources: [`http-get://${basePath}/health`],
        timeout: 10000,
        validateStatus: (status) => status === 200,
        log: true,
    });
    console.log('Test server ponged successfully!');

    return {
        port: (await getConfig()).server.port,
        stop: () => {},
    };
};

const getHostname = (config: IAppConfig): string => {
    return config.server.hostname !== '0.0.0.0'
        ? config.server.hostname
        : process.env.HOSTNAME || 'localhost';
};

const getConfig = async (): Promise<IAppConfig> => {
    if (!config) config = await loadConfig();
    return config;
};

const loadConfig = async (): Promise<IAppConfig> => {
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
            throw new Error(`Config file not found at path: ${confPath}`);
        }
        const customConfig = await import(confPath);
        // !important try config first as it is in the default config
        return customConfig.config || customConfig.default || customConfig;
    } catch (error) {
        throw new Error(`Error loading config file: ${(error as Error).message}`);
    }
};
