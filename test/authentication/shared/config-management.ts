import * as fs from 'fs';
import * as path from 'path';
import { IApiConfig, IRunnerScriptConfig, ITestConfig } from './config.interface';

export class ConfigManager {
    private static instance: ConfigManager;
    private _config: ITestConfig | undefined;

    private constructor() {}

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    public async apiConfig(): Promise<IApiConfig> {
        return (await this.config()).api;
    }

    public async runnerScript(): Promise<IRunnerScriptConfig> {
        return (await this.config()).runnerScript;
    }

    private async config(): Promise<ITestConfig> {
        if (!this._config) {
            this._config = await loadConfigFromFile();
            if (!this._config) {
                throw new Error('Config failed to load.');
            }
        }
        return this._config;
    }
}

const loadConfigFromFile = async (): Promise<ITestConfig> => {
    const confPathRaw = process.env.TEST_CONFIG;
    if (!confPathRaw) {
        throw new Error(`TEST_CONFIG environment variable is not set.`);
    }

    try {
        const confPath = path.isAbsolute(confPathRaw)
            ? confPathRaw
            : path.resolve(process.cwd(), confPathRaw);

        console.log(`Loading configuration from: ${confPath}`);
        if (!fs.existsSync(confPath)) {
            console.warn(`Config file not found, using default config`);
            throw new Error(`TEST_CONFIG environment variable is not set.`);
        }
        const customConfig = await import(confPath);
        // !important try config first as it is in the default config
        return customConfig.config || customConfig.default || customConfig;
    } catch (error) {
        console.error(`Error loading config file: ${(error as Error).message}`);
        console.log('Falling back to default configuration');
        throw new Error(`TEST_CONFIG environment variable is not set.`);
    }
};
