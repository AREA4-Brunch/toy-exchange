export interface ILoginPresentationConfig {
    api?: ILoginApiConfig;
}

export interface ILoginApiConfig {
    routes: ILoginRoutesConfig;
    middleware: ILoginMiddlewareConfig;
}

export interface ILoginRoutesConfig {
    loginBasePath: string;
}

export interface ILoginMiddlewareConfig {}
