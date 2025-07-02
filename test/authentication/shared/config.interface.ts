export interface IEndpointConfig {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
    headers?: Record<string, string>;
}

export interface IAuthenticationApiConfig {
    endpoint: string;
    regularUser: IRegularUserApiConfig;
}

export interface ILoginRoutesConfig {
    endpoint: string;
    login: IEndpointConfig;
}

export interface IHealthRoutesConfig {
    endpoint: string;
    health: IEndpointConfig;
    test: {
        endpoint: string;
        public: IEndpointConfig;
        authenticated: IEndpointConfig;
        singleRole: IEndpointConfig;
        multipleRolesAll: IEndpointConfig;
        multipleRolesSome: IEndpointConfig;
        forbiddenRoles: IEndpointConfig;
        combinedRequirements: IEndpointConfig;
        allAndSome: IEndpointConfig;
        someAndNone: IEndpointConfig;
        allAndNone: IEndpointConfig;
        doubleMiddleware: IEndpointConfig;
        adminOnly: IEndpointConfig;
        superAdmin: IEndpointConfig;
        moderatorOrAdmin: IEndpointConfig;
        noBannedUsers: IEndpointConfig;
    };
}

export interface IRegularUserApiConfig {
    endpoint: string;
    login: ILoginRoutesConfig;
    health: IHealthRoutesConfig;
}

export interface IApiConfig {
    endpoint: string;
    authentication: IAuthenticationApiConfig;
}

export interface IRunnerScriptConfig {
    server: IServerRunnerConfig;
    tests: ITestsRunnerConfig;
}

export interface IServerRunnerConfig {
    port: number;
    hostname: string;
    pingTimeout: number;
    serverPingEndpoint: string;
    serverDir: string;
    configPath: string;
    startCmnd: string;
}

export interface ITestsRunnerConfig {
    testDir: string;
    testConfigPath: string;
}

export interface ITestConfig {
    api: IApiConfig;
    runnerScript: IRunnerScriptConfig;
}
