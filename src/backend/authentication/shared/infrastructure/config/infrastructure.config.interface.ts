export interface IRoutesConfig {
    readonly apiBasePath: string;
    readonly staticBasePath: string;
    readonly staticContents: {
        route: string;
        fspath: string;
    }[];
}
