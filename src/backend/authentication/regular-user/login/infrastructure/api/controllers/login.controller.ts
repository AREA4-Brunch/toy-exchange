import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { LOGIN_APPLICATION_TYPES } from '../../../application/di/login-application.types';
import {
    ILoginInput,
    ILoginUseCase,
} from '../../../application/use-cases/login.interfaces';

@singleton()
@injectable()
export class LoginController {
    constructor(
        @inject(LOGIN_APPLICATION_TYPES.LoginUseCase)
        private readonly loginUseCase: ILoginUseCase,
    ) {}

    login(req: express.Request, res: express.Response): void {
        res.json(this.loginUseCase.execute(req.body as ILoginInput));
    }
}
