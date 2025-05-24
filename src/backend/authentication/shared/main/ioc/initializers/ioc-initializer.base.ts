import { Router } from 'express';
import { DependencyContainer } from 'tsyringe';

export interface IocInitializer<TConfig> {
    initialize(
        container: DependencyContainer,
        router: Router,
        config: TConfig,
    ): Promise<void>;
}

export abstract class IoC<TConfig> implements IocInitializer<TConfig> {
    public async initialize(
        container: DependencyContainer,
        router: Router,
        config: TConfig,
    ): Promise<void> {
        await this.onInitStart(container, router, config);
        const childContainer = await this.bind(container, config);
        const childRouter = await this.loadRoutes(router, config);
        const childConfig = await this.getChildConfig(config);
        await this.initChildIoC(childContainer, childRouter, childConfig);
    }

    protected async onInitStart(
        container: DependencyContainer,
        router: Router,
        config: TConfig,
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

    protected async getChildConfig(config: TConfig): Promise<unknown> {
        return config;
    }

    protected async initChildIoC(
        container: DependencyContainer,
        router: Router,
        config: unknown,
    ): Promise<void> {}
}

export class IoCModule<TConfig> extends IoC<TConfig> {
    constructor(private readonly inits: IoC<TConfig>[]) {
        super();
    }

    protected async initChildIoC(
        container: DependencyContainer,
        router: Router,
        config: TConfig,
    ): Promise<void> {
        this.inits.forEach(async (init) => {
            await init.initialize(container, router, config);
        });
    }
}
