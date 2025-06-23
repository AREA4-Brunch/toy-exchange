import { Router } from 'express';
import { DependencyContainer, InjectionToken } from 'tsyringe';
import { RoutesLoader } from '../../../infrastructure/routes/routes-loader.base';
import { IIoCBinder } from '../binders/ioc-binder.interface';

export interface IIoC<TConfig> {
    initialize(
        container: DependencyContainer,
        router: Router,
        config: TConfig,
    ): Promise<void>;
}

export interface IChildrenIoCsProvider<TConfig> {
    /**
     * @returns Array of to-be asynchronously resolved groups of to-be mutually
     *          synchronously initialized IoCs with their provided configs.
     */
    (
        container: DependencyContainer,
        router: Router,
        conf: TConfig,
    ): [InjectionToken<IIoC<any>>, any][][];
}

export abstract class IoC<TConfig> implements IIoC<TConfig> {
    constructor(
        protected readonly childrenIoCsProvider: IChildrenIoCsProvider<TConfig>,
    ) {}

    public async initialize(
        container: DependencyContainer,
        router: Router,
        config: TConfig,
    ): Promise<void> {
        const childContainer = await this.bind(container, config);
        const childRouter = await this.loadRoutes(container, router, config);
        await this.initChildrenIoCs(childContainer, childRouter, config);
    }

    /**
     * @returns Container used to init children IoCs.
     */
    protected abstract bind(
        container: DependencyContainer,
        config: TConfig,
    ): Promise<DependencyContainer>;

    /**
     * @returns Router used to init children IoCs.
     */
    protected abstract loadRoutes(
        container: DependencyContainer,
        router: Router,
        config: TConfig,
    ): Promise<Router>;

    protected async initChildrenIoCs(
        container: DependencyContainer,
        router: Router,
        config: TConfig,
    ): Promise<void> {
        // now can resolve after its dependencies were registered via bind()
        await Promise.all(
            this.childrenIoCsProvider(container, router, config).map(
                async (syncGroup) => {
                    syncGroup.forEach(async ([ioc, iocConfig]) => {
                        await container
                            .resolve<IIoC<any>>(ioc)
                            .initialize(container, router, iocConfig);
                    });
                },
            ),
        );
    }
}

export class ModuleIoC<TConfig> extends IoC<TConfig> {
    constructor(
        protected readonly binder: IIoCBinder<TConfig>,
        protected readonly apiBasePathProvider: (conf: TConfig) => string,
        childrenIoCsProvider: IChildrenIoCsProvider<TConfig> = (c, r, co) => [],
    ) {
        super(childrenIoCsProvider);
    }

    protected async bind(
        container: DependencyContainer,
        config: TConfig,
    ): Promise<DependencyContainer> {
        this.binder.bind(container, config);
        return container.createChildContainer();
    }

    protected async loadRoutes(
        container: DependencyContainer,
        router: Router,
        config: TConfig,
    ): Promise<Router> {
        const childRouter = await this.createCommonChildRouter();
        const apiBasePath = this.apiBasePathProvider(config);
        router.use(apiBasePath, childRouter);
        console.debug(`Registered module router: ${apiBasePath}`);
        return childRouter;
    }

    protected async createCommonChildRouter(): Promise<Router> {
        return Router();
    }
}

export class FeatureIoC<TConfig> extends IoC<TConfig> {
    constructor(
        protected readonly binder: IIoCBinder<TConfig>,
        protected readonly routesLoadersProvider: (
            container: DependencyContainer,
            router: Router,
            conf: TConfig,
        ) => [InjectionToken<RoutesLoader<any>>, any][][],
        childrenIoCsProvider: IChildrenIoCsProvider<TConfig> = (c, r, co) => [],
    ) {
        super(childrenIoCsProvider);
    }

    protected async bind(
        container: DependencyContainer,
        config: TConfig,
    ): Promise<DependencyContainer> {
        this.binder.bind(container, config);
        return container;
    }

    protected async loadRoutes(
        container: DependencyContainer,
        router: Router,
        config: TConfig,
    ): Promise<Router> {
        // now can resolve after its dependencies were registered via bind()
        await Promise.all(
            this.routesLoadersProvider(container, router, config).map(
                async (syncGroup) => {
                    syncGroup.forEach(async ([loader, loaderConf]) => {
                        await container
                            .resolve<RoutesLoader<any>>(loader)
                            .loadRoutes(router, loaderConf, container);
                    });
                },
            ),
        );
        return router;
    }
}
