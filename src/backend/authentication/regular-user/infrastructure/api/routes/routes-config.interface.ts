export interface IRoutesConfig {
    readonly apiBasePath: string;
    readonly staticBasePath: string;
    readonly staticContent: {
        route: string;
        fspath: string;
    }[];
}
