import path from 'path';
import { IApiConfig, ITestConfig } from '../shared/config.interface';

const PORT = parseInt(process.env.APP_PORT || '3002');
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
                    public: {
                        endpoint: '/public',
                        method: 'GET',
                    },
                    authenticated: {
                        endpoint: '/authenticated',
                        method: 'GET',
                    },
                    singleRole: {
                        endpoint: '/single-role',
                        method: 'GET',
                    },
                    multipleRolesAll: {
                        endpoint: '/multiple-roles-all',
                        method: 'GET',
                    },
                    multipleRolesSome: {
                        endpoint: '/multiple-roles-some',
                        method: 'GET',
                    },
                    forbiddenRoles: {
                        endpoint: '/forbidden-roles',
                        method: 'GET',
                    },
                    combinedRequirements: {
                        endpoint: '/combined-requirements',
                        method: 'GET',
                    },
                    allAndSome: {
                        endpoint: '/all-and-some',
                        method: 'GET',
                    },
                    someAndNone: {
                        endpoint: '/some-and-none',
                        method: 'GET',
                    },
                    allAndNone: {
                        endpoint: '/all-and-none',
                        method: 'GET',
                    },
                    doubleMiddleware: {
                        endpoint: '/double-middleware',
                        method: 'GET',
                    },
                    adminOnly: {
                        endpoint: '/admin-only',
                        method: 'GET',
                    },
                    superAdmin: {
                        endpoint: '/super-admin',
                        method: 'GET',
                    },
                    moderatorOrAdmin: {
                        endpoint: '/moderator-or-admin',
                        method: 'GET',
                    },
                    noBannedUsers: {
                        endpoint: '/no-banned-users',
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
    process.env.SERVER_DIR ?? path.join(rootDir, 'development', 'backend', 'authentication'),
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
            startCmnd: 'start:test',
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
                    'local.config.js',
                ),
        },
    },
};

export default config;
