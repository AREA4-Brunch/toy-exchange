export interface IAppConfig {
    server: IServerConfig;
}

export interface IServerConfig {
    http: {
        port: number;
        hostname: string;
    };
}
