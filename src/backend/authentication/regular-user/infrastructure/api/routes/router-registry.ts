import { Router } from 'express';
import { injectable, singleton } from 'tsyringe';
import { LoginRouter } from './login.router';
import { HealthRouter } from './health.router';

@singleton()
@injectable()
export class RouterRegistry {
    public readonly mainRouter = Router();

    constructor(healthRouter: HealthRouter, loginRouter: LoginRouter) {
        healthRouter.registerRoutes(this);
        loginRouter.registerRoutes(this);
    }

    public registerRouter(path: string, router: Router): void {
        this.mainRouter.use(path, router);
    }
}
