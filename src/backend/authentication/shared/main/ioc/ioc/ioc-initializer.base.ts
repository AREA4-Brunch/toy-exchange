import { Router } from 'express';
import { DependencyContainer, InjectionToken } from 'tsyringe';
import { fetchObjectProperty } from '../../../common/class-utils';
import { IRoutesConfig } from '../../../infrastructure/config/infrastructure.config.interface';
import { IRoutesLoader } from '../../../infrastructure/routes/routes-loader.base';
import { IIoCBinder } from '../binders/ioc-binder.interface';

export interface IIoCInitializeArgs<TConfig> {
    container: DependencyContainer;
    router: Router;
    config: TConfig;
}

export interface IIoC<TConfig> {
    initialize(args: IIoCInitializeArgs<TConfig>): Promise<void>;
}

export abstract class IoC<TConfig, TChildConfig = unknown>
    implements IIoC<TConfig>
{
    public async initialize({
        container,
        router,
        config,
    }: IIoCInitializeArgs<TConfig>): Promise<void> {
        await this.onInitStart({ container, router, config });
        const childContainer = await this.bind(container, config);
        const childRouter = await this.loadRoutes(router, config);
        const childConfig = await this.getChildConfig(config);
        await this.initChildIoC({
            container: childContainer,
            router: childRouter,
            config: childConfig,
        });
    }

    protected async onInitStart(
        arg: IIoCInitializeArgs<TConfig>,
    ): Promise<void> {}

    protected async bind(
        container: DependencyContainer,
        config: TConfig,
    ): Promise<DependencyContainer> {
        return container;
    }

    protected async loadRoutes(
        router: Router,
        config: TConfig,
    ): Promise<Router> {
        return router;
    }

    protected async getChildConfig(config: TConfig): Promise<TChildConfig> {
        return config as unknown as TChildConfig;
    }

    protected async initChildIoC(
        args: IIoCInitializeArgs<TChildConfig>,
    ): Promise<void> {}
}

export abstract class IoCContainerizedModule<TConfig> extends IoC<TConfig> {
    protected rootContainer!: DependencyContainer;

    constructor(private readonly inits: InjectionToken[]) {
        super();
    }

    protected override async onInitStart(
        arg: IIoCInitializeArgs<TConfig>,
    ): Promise<void> {
        this.rootContainer = arg.container;
    }

    protected async initChildIoC(
        _: IIoCInitializeArgs<TConfig>,
    ): Promise<void> {
        this.inits.forEach(async (init) => {
            const { container, router, config } = this.getChildInitArgs(init);
            // !important fetch initializer from the child container to
            // construct the initializer with child container instances
            await container
                .resolve<IIoC<unknown>>(init)
                .initialize({ container, router, config });
        });
    }

    protected getChildInitArgs(
        init: InjectionToken,
    ): IIoCInitializeArgs<unknown> {
        return {
            container: this.getChildInitContainer(init),
            router: this.getChildInitRouter(init),
            config: this.getChildInitConfig(init),
        };
    }

    protected getChildInitContainer(init: InjectionToken): DependencyContainer {
        return this.rootContainer.createChildContainer();
    }

    protected abstract getChildInitRouter(init: InjectionToken): Router;

    protected abstract getChildInitConfig(init: InjectionToken): unknown;
}

export class ModuleIoC<TConfig> extends IoCContainerizedModule<TConfig> {
    protected commonChildRouter: Router | undefined;
    protected config: TConfig | undefined;

    constructor(
        protected readonly binder: IIoCBinder<TConfig>,
        private readonly apiBasePathConfigProperty: string,
        private readonly initsConfigProps: Map<InjectionToken, string>,
    ) {
        super(Array.from(initsConfigProps.keys()));
    }

    protected override async bind(
        container: DependencyContainer,
        config: TConfig,
    ): Promise<DependencyContainer> {
        this.binder.bind(container, config);
        return container;
    }

    protected override async loadRoutes(
        router: Router,
        config: TConfig,
    ): Promise<Router> {
        this.commonChildRouter = this.createCommonChildRouter();
        router.use(this.getBasePath(config), this.commonChildRouter);
        console.debug(`Registered module router: ${this.getBasePath(config)}`);
        return this.commonChildRouter;
    }

    protected override async onInitStart({
        container,
        router,
        config,
    }: IIoCInitializeArgs<TConfig>): Promise<void> {
        await super.onInitStart({ container, router, config });
        this.config = config;
    }

    protected getChildInitRouter(init: InjectionToken): Router {
        if (!this.commonChildRouter) {
            throw new Error('Common child router is not initialized.');
        }
        return this.commonChildRouter;
    }

    protected getChildInitConfig(init: InjectionToken): unknown {
        const property: string = this.initsConfigProps.get(init)!;
        return this.extractSubConfig<unknown>(init, property);
    }

    protected createCommonChildRouter(): Router {
        return Router();
    }

    protected getBasePath(config: TConfig): string {
        return fetchObjectProperty<string>(
            config,
            this.apiBasePathConfigProperty,
        );
    }

    private extractSubConfig<T>(init: InjectionToken, property: string): T {
        const childConfig = fetchObjectProperty<T>(this.config, property);
        if (!childConfig) {
            console.warn(
                `Sub-config ${property} = ${childConfig}\nfor init: ${String(init)}.`,
            );
        }
        return childConfig;
    }
}

export class FeatureIoC<TConfig> extends IoCContainerizedModule<TConfig> {
    protected rootRouter: Router | undefined;
    protected config: TConfig | undefined;

    constructor(
        protected readonly binder: IIoCBinder<TConfig>,
        private readonly routesConfs: Map<InjectionToken, string> = new Map(),
        private readonly initsConfs: Map<InjectionToken, string> = new Map(),
    ) {
        super(Array.from(initsConfs.keys()));
    }

    protected override async onInitStart({
        container,
        router,
        config,
    }: IIoCInitializeArgs<TConfig>): Promise<void> {
        await super.onInitStart({ container, router, config });
        this.rootRouter = router;
        this.config = config;
    }

    protected override async bind(
        container: DependencyContainer,
        config: TConfig,
    ): Promise<DependencyContainer> {
        this.binder.bind(container, config);
        return container;
    }

    protected override async loadRoutes(
        router: Router,
        config: TConfig,
    ): Promise<Router> {
        // now can resolve after its dependencies were registered via bind()
        this.routesConfs.forEach(async (property, token, _) => {
            await this.rootContainer
                .resolve<IRoutesLoader<IRoutesConfig>>(token)
                .loadRoutes(
                    router,
                    this.extractSubConfig<IRoutesConfig>(token, property),
                    this.rootContainer,
                );
        });
        return router;
    }

    protected override getChildInitContainer(
        init: InjectionToken,
    ): DependencyContainer {
        return this.rootContainer;
    }

    protected getChildInitRouter(init: InjectionToken): Router {
        if (!this.rootRouter) {
            throw new Error(`Root router for child IoC is not initialized.`);
        }
        return this.rootRouter;
    }

    protected getChildInitConfig(init: InjectionToken): unknown {
        const property: string = this.initsConfs.get(init)!;
        return this.extractSubConfig<unknown>(init, property);
    }

    private extractSubConfig<T>(init: InjectionToken, property: string): T {
        const childConfig = fetchObjectProperty<T>(this.config, property);
        if (!childConfig) {
            console.warn(
                `Sub-config ${property} = ${childConfig}\nfor init: ${String(init)}.`,
            );
        }
        return childConfig;
    }
}
