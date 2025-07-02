export interface IHealthPresentationConfig {
    api?: IHealthApiConfig;
}

export interface IHealthApiConfig {
    routes: IHealthRoutesConfig;
}
export interface IHealthRoutesConfig {
    healthBasePath: string;
    testEnabled: boolean;
    testRoleCheckingPath: string;
}
