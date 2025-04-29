export interface IAppConfig {
    readonly server: IServerConfig;
}

export interface IServerConfig {
    readonly port: string | number;
}
