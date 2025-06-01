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
        health: IEndpointConfig;
        healthSomeRole: IEndpointConfig;
        healthMultipleRoles: IEndpointConfig;
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
}

export interface ITestsRunnerConfig {
    testDir: string;
    testConfigPath: string;
}

export interface ITestConfig {
    api: IApiConfig;
    runnerScript: IRunnerScriptConfig;
}
