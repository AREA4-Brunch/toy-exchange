import express from 'express';
import { injectable, singleton } from 'tsyringe';

@singleton()
@injectable()
export class HealthHandler {
    ping(req: express.Request, res: express.Response): void {
        res.status(200).json({ msg: 'Pong!' });
    }
}
