import path from 'path';
import { IApiConfig, ITestConfig } from '../shared/config.interface';

const api: IApiConfig = {
    endpoint: `http://${process.env.HOSTNAME}:${process.env.PORT}`,
    authentication: {
        endpoint: '/api/v1/auth',
        regularUser: {
            endpoint: '/regular-user',
            health: {
                endpoint: '/health',
                health: {
                    endpoint: '',
                    method: 'GET',
                },
                test: {
                    endpoint: '/test',
                    health: {
                        endpoint: '/health/test',
                        method: 'GET',
                    },
                    healthSomeRole: {
                        endpoint: '/health/test/some-role',
                        method: 'GET',
                    },
                    healthMultipleRoles: {
                        endpoint: '/health/test/multiple-roles',
                        method: 'GET',
                    },
                },
            },
            login: {
                endpoint: '/login',
                login: {
                    endpoint: '',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                },
            },
        },
    },
};

const rootDir = path.resolve(
    // !important fallback is compiled js file relative
    process.env.PROJECT_ROOT ?? path.resolve(__dirname, '../../../../../../'),
);

const serverDir = path.resolve(
    process.env.SERVER_DIR ?? path.join(rootDir, 'src', 'backend', 'authentication'),
);

const testDir = path.resolve(process.env.TEST_DIR ?? path.join(rootDir, 'test', 'authentication'));

console.info(`Using root directory: ${rootDir}`);

const config: ITestConfig = {
    api: api,
    runnerScript: {
        server: {
            port: Number(process.env.PORT || '3001'),
            hostname: process.env.HOSTNAME || 'localhost',
            pingTimeout: Number(process.env.PING_TIMEOUT) || 30000,
            serverPingEndpoint: process.env.HEALTH_ENDPOINT || '/api/v1/auth/regular-user/health',
            serverDir: serverDir,
            configPath: path.join(serverDir, 'dist', 'config', 'app-config', 'test.config.js'),
        },
        tests: {
            testDir: testDir,
            testConfigPath:
                process.env.TEST_CONFIG
                || path.join(
                    testDir,
                    'dist',
                    'test',
                    'authentication',
                    'config',
                    'default.config.js',
                ),
        },
    },
};

export default config;
