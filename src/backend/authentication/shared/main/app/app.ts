import { Container } from 'inversify';
import { IAppConfig } from './app-config.interface.ts';
import { IIocBinder } from '../ioc/ioc-binder.interface.ts';
import { IIocInitializer } from '../ioc/ioc-initializer.interface.ts';
import express from 'express';

export class Application {
    protected constructor(
        public readonly app: express.Express,
        private readonly container: Container,
        private readonly config: IAppConfig,
        private readonly binder: IIocBinder,
        private readonly initializer: IIocInitializer,
        private readonly bindSelfKey: string,
    ) {}

    public static async create(
        config: IAppConfig,
        binder: IIocBinder,
        initializer: IIocInitializer,
        container: Container = new Container(),
        app: express.Express = express(),
        bindKey: string = '_App_',
    ): Promise<Application> {
        const application = new Application(
            app,
            container,
            config,
            binder,
            initializer,
            bindKey,
        );
        if (application.isBindSelfKeyAvailable()) {
            throw new Error(`Bind key "${bindKey}" is not available.`);
        }
        application.bindSelf();
        return await application.init();
    }

    public static async createUnsafe(
        config: IAppConfig,
        binder: IIocBinder,
        initializer: IIocInitializer,
        container: Container = new Container(),
        app: express.Express = express(),
        bindKey: string = '_App_',
    ): Promise<Application> {
        const application = new Application(
            app,
            container,
            config,
            binder,
            initializer,
            bindKey,
        );
        application.bindSelf();
        return await application.init();
    }

    public listenHttp(
        port?: string | number,
        callback: (() => void) | null = null,
    ): void {
        this.app.listen(
            port || this.config.server.port,
            callback || (() => console.log(`App is listening on port ${port}`)),
        );
    }

    protected async init(): Promise<Application> {
        this.binder.bind(this.container);
        this.initializer.initialize(this.config);
        return this;
    }

    protected bindSelf() {
        this.container
            .bind<express.Express>(this.bindSelfKey)
            .toConstantValue(this.app);
    }

    protected isBindSelfKeyAvailable(): boolean {
        return (
            this.container.isBound(this.bindSelfKey) &&
            this.container.get(this.bindSelfKey) !== this.app
        );
    }
}
