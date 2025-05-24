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

export interface ITestConfig {
    api: IApiConfig;
}
