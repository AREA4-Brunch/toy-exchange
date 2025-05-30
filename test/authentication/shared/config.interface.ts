export interface IEndpointConfig {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
    headers?: Record<string, string>;
}

export interface IAuthenticationApiConfig {
    endpoint: string;
    regularUser: IRegularUserApiConfig;
}

export interface IRegularUserApiConfig {
    endpoint: string;
    health: IEndpointConfig;
    login: IEndpointConfig;
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
