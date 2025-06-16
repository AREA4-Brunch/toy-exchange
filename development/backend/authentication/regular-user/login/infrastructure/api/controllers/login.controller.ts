import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { LOGIN_APPLICATION_TYPES } from '../../../application/di/login.types';
import {
    ILoginInput,
    ILoginUseCase,
} from '../../../application/use-cases/login.use-case.interface';
import { ILoginResponseDto } from '../dtos/login.response.dto';
import { LoginResponseMapper } from '../mappers/login-response.mapper';

@singleton()
@injectable()
export class LoginController {
    constructor(
        @inject(LOGIN_APPLICATION_TYPES.LoginUseCase)
        private readonly loginUseCase: ILoginUseCase,
        private readonly mapper: LoginResponseMapper,
    ) {}

    async login(
        req: express.Request,
        res: express.Response<ILoginResponseDto>,
    ): Promise<void> {
        return this.loginUseCase
            .execute(req.body as ILoginInput)
            .then((result) => {
                res.json(this.mapper.success(res, result));
            })
            .catch((err: unknown) => {
                res.json(this.mapper.domainError(res, err));
            });
    }
}
