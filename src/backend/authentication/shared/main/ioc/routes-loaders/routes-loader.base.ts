import express, { Router } from 'express';
import { IRoutesConfig } from '../../../infrastructure/config/infrastructure.config.interface';

export interface IRoutesLoader<TConfig> {
    loadRoutes(router: Router, config: TConfig): Promise<Router>;
}

export abstract class RoutesLoader<TConfig> implements IRoutesLoader<TConfig> {
    public abstract loadRoutes(
        router: Router,
        config: TConfig,
    ): Promise<Router>;

    protected registerRouters(
        root: Router,
        routers: { path: string; router: Router }[],
    ) {
        routers.forEach(({ path, router }) => {
            root.use(path, router);
            console.debug(`Loaded router: ${path}`);
        });
    }

    protected registerStaticRoutes(
        router: Router,
        loginRoutesConfig: IRoutesConfig,
    ) {
        loginRoutesConfig.staticContents.forEach(({ route, fspath }) => {
            const fullRoute = `${loginRoutesConfig.staticBasePath}${route}`;
            router.use(fullRoute, express.static(fspath));
            console.log(`Exposing static artifact: ${fspath}\nat ${fullRoute}`);
        });
    }
}
