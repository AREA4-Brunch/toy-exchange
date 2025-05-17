import express from 'express';
import { injectable, singleton } from 'tsyringe';
import { HealthController } from '../controllers/health.controller';

@singleton()
@injectable()
export class HealthRouter {
    constructor(private readonly healthController: HealthController) {}

    public getRouters(): { path: string; router: express.Router }[] {
        return [{ path: `/health`, router: this.createHealthRouter() }];
    }

    private createHealthRouter() {
        const health = express.Router();
        health
            .route(``)
            .get((req, res) => this.healthController.ping(req, res));
        return health;
    }
}
