import express from 'express';
import { injectable, singleton } from 'tsyringe';
import { RouterRegistry } from './router-registry';
import { HealthController } from '../controllers/health.controller';

@singleton()
@injectable()
export class HealthRouter {
    constructor(private readonly healthController: HealthController) {}

    public registerRoutes(routerRegistry: RouterRegistry): void {
        routerRegistry.registerRouter(`/health`, this.createHealthRouter());
    }

    private createHealthRouter() {
        const health = express.Router();
        health
            .route(``)
            .get((req, res) => this.healthController.ping(req, res));
        return health;
    }
}
