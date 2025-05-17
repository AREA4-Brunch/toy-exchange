import express from 'express';
import { DependencyContainer } from 'tsyringe';

export interface IAppConfig {
    readonly server: IServerConfig;
    readonly main: IConfigMain;
}

export interface IServerConfig {
    readonly port: number;
    readonly hostname: string;
}

export interface IConfigMain {
    readonly di: {
        app?: express.Express;
        appBindSymbol: symbol;
        readonly container: DependencyContainer;
    };
}
