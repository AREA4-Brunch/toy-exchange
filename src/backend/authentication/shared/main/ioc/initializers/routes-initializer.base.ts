import express, { Router } from 'express';
import { IRoutesConfig } from '../../../infrastructure/config/infrastructure-config.interface';
import { IoC } from './ioc-initializer.base';

export class RoutesInitializer<TConfig> extends IoC<TConfig> {
    protected registerRouters(
        root: Router,
        routers: { path: string; router: Router }[],
    ) {
        routers.forEach(({ path, router }) => {
            root.use(path, router);
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
