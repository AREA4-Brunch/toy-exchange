import express, { Router } from 'express';
import { injectable, singleton } from 'tsyringe';
import { HealthRouter } from './health.router';
import { LoginRouter } from './login.router';

@singleton()
@injectable()
export class RouterRegistry {
    public readonly mainRouter = Router();

    constructor(healthRouter: HealthRouter, loginRouter: LoginRouter) {
        this.registerRouters(healthRouter.getRouters());
        this.registerRouters(loginRouter.getRouters());
    }

    private registerRouters(
        routers: { path: string; router: express.Router }[],
    ) {
        routers.forEach(({ path, router }) =>
            this.registerRouter(path, router),
        );
    }

    private registerRouter(path: string, router: Router): void {
        this.mainRouter.use(path, router);
    }
}
