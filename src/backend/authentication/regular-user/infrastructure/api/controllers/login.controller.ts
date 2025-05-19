import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { APPLICATION_TYPES } from '../../../application/di/types';
import {
    ILoginInput,
    ILoginUseCase,
} from '../../../application/use-cases/login.interfaces';

@singleton()
@injectable()
export class LoginController {
    constructor(
        @inject(APPLICATION_TYPES.LoginUseCase)
        private readonly loginUseCase: ILoginUseCase,
    ) {}

    login(req: express.Request, res: express.Response): void {
        res.json(this.loginUseCase.execute(req.body as ILoginInput));
    }
}
