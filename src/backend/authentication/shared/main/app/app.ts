import express from 'express';
import { IocBinder } from '../ioc/binders/ioc-binder.base';
import { IocInitializer } from '../ioc/initializers/ioc-initializer.base';
import { IAppConfig } from './app-config.interface';

export class Application {
    protected constructor(
        public readonly app: express.Express,
        private readonly config: IAppConfig,
        private readonly binder: IocBinder<IAppConfig>,
        private readonly initializer: IocInitializer<IAppConfig>,
    ) {}

    public static async create(
        config: IAppConfig,
        binder: IocBinder<IAppConfig>,
        initializer: IocInitializer<IAppConfig>,
    ): Promise<Application> {
        const app = config.main.di.app || express();
        config.main.di.app = app;
        const application = new Application(app, config, binder, initializer);
        return await application.init();
    }

    public listenHttp(
        port?: number,
        hostname?: string,
        callback: (() => void) | null = null,
    ): void {
        port = port || this.config.server.port;
        hostname = hostname || this.config.server.hostname;
        this.app.listen(
            port,
            hostname,
            callback || (() => console.log(`App is listening on port ${port}`)),
        );
    }

    protected async init(): Promise<Application> {
        await this.binder.bind(this.config.main.di.container, this.config);
        await this.initializer.initialize(this.config);
        return this;
    }
}
