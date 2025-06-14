import path from 'path';
import { IApiConfig, ITestConfig } from '../shared/config.interface';

const PORT = parseInt(process.env.APP_PORT || '3001');
const HOSTNAME = process.env.APP_HOSTNAME || 'localhost';

const api: IApiConfig = {
    endpoint: `http://${HOSTNAME}:${PORT}`,
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
                    endpoint: '-test',
                    health: {
                        endpoint: '',
                        method: 'GET',
                    },
                    healthSomeRole: {
                        endpoint: '/some-role',
                        method: 'GET',
                    },
                    healthMultipleRoles: {
                        endpoint: '/multiple-roles',
                        method: 'GET',
                    },
                    healthForbiddenRoles: {
                        endpoint: '/forbidden-roles',
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
            port: PORT,
            hostname: HOSTNAME,
            pingTimeout: Number(process.env.PING_TIMEOUT) || 60000,
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
