import express, { Router } from 'express';
import { DependencyContainer } from 'tsyringe';
import { IRoutesConfig } from '../config/infrastructure.config.interface';

export interface IRoutesLoader<TConfig extends IRoutesConfig> {
    loadRoutes(
        router: Router,
        config: TConfig,
        container: DependencyContainer,
    ): Promise<void>;
}

export abstract class RoutesLoader<TConfig extends IRoutesConfig>
    implements IRoutesLoader<TConfig>
{
    async loadRoutes(
        root: Router,
        config: TConfig,
        container: DependencyContainer,
    ): Promise<void> {
        this.loadRouters(root);
        this.registerStaticRoutes(root, config);
    }

    protected loadRouters(root: Router) {
        this.getRouters().forEach(({ path, router }) => {
            root.use(path, router);
            console.debug(`Loaded router: ${path}`);
        });
    }

    protected abstract getRouters(): { path: string; router: express.Router }[];

    protected registerStaticRoutes(router: Router, conf: IRoutesConfig) {
        conf.staticContents.forEach(({ route, fspath }) => {
            const fullRoute = `${conf.staticBasePath}${route}`;
            router.use(fullRoute, express.static(fspath));
            console.log(`Exposing static artifact: ${fspath}\nat ${fullRoute}`);
        });
    }
}
