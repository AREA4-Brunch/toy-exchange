export interface IAppConfig {
    readonly server: IServerConfig;
}

export interface IServerConfig {
    readonly http: {
        readonly port: number;
        readonly hostname: string;
    };
}
